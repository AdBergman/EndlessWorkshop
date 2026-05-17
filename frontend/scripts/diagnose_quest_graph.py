#!/usr/bin/env python3

from __future__ import annotations

import json
import sys
import urllib.request
from pathlib import Path
from typing import Any


def clean(value: Any) -> str:
    return "" if value is None else str(value).strip()


def string_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []

    return [clean(item) for item in value if clean(item)]


def finite_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def normalize_step(step: dict[str, Any], index: int) -> dict[str, Any]:
    return {
        "stepIndex": step.get("stepIndex") if finite_number(step.get("stepIndex")) else step.get("index", index),
        "stepOrder": step.get("stepOrder") if finite_number(step.get("stepOrder")) else index,
        "objectiveText": step.get("objectiveText"),
        "nextQuestKey": clean(step.get("nextQuestKey")) or None,
        "failQuestKey": clean(step.get("failQuestKey")) or None,
        "descriptionLines": string_list(step.get("descriptionLines")),
        "completionPrerequisiteLines": string_list(step.get("completionPrerequisiteLines")),
        "failurePrerequisiteLines": string_list(step.get("failurePrerequisiteLines")),
        "forbiddenPrerequisiteLines": string_list(step.get("forbiddenPrerequisiteLines")),
        "selectionPrerequisiteLines": string_list(step.get("selectionPrerequisiteLines")),
        "rewardDisplayLines": string_list(step.get("rewardDisplayLines")),
        "referenceKeys": string_list(step.get("referenceKeys")),
        "dialogBlockIdentities": string_list(step.get("dialogBlockIdentities")),
    }


def normalize_choice(choice: dict[str, Any], index: int) -> dict[str, Any]:
    steps = choice.get("steps")

    return {
        "choiceKey": clean(choice.get("choiceKey")) or f"Choice_{index}",
        "displayName": choice.get("displayName"),
        "choiceOrder": choice.get("choiceOrder") if finite_number(choice.get("choiceOrder")) else index,
        "descriptionLines": string_list(choice.get("descriptionLines")),
        "completionPrerequisiteLines": string_list(choice.get("completionPrerequisiteLines")),
        "failurePrerequisiteLines": string_list(choice.get("failurePrerequisiteLines")),
        "rewardDisplayLines": string_list(choice.get("rewardDisplayLines")),
        "nextQuestKeys": string_list(choice.get("nextQuestKeys")),
        "referenceKeys": string_list(choice.get("referenceKeys")),
        "steps": [
            normalize_step(step, step_index)
            for step_index, step in enumerate(steps if isinstance(steps, list) else [])
            if isinstance(step, dict)
        ],
    }


def normalize_quest(quest: dict[str, Any], index: int) -> dict[str, Any]:
    choices = quest.get("choices")

    return {
        "questKey": clean(quest.get("questKey") or quest.get("entryKey")) or f"Quest_{index}",
        "displayName": quest.get("displayName"),
        "descriptionLines": string_list(quest.get("descriptionLines")),
        "categoryKey": quest.get("categoryKey"),
        "categoryType": quest.get("categoryType"),
        "branchStart": bool(quest.get("branchStart", quest.get("isBranchStart"))),
        "branchEnd": bool(quest.get("branchEnd", quest.get("isBranchEnd"))),
        "mandatory": bool(quest.get("mandatory", quest.get("isMandatory"))),
        "keyNarrativeBeat": bool(quest.get("keyNarrativeBeat", quest.get("isKeyNarrativeBeat"))),
        "narrativeVictoryPathChoice": bool(
            quest.get("narrativeVictoryPathChoice", quest.get("isNarrativeVictoryPathChoice"))
        ),
        "chapterKey": quest.get("chapterKey"),
        "chapterIndex": quest.get("chapterIndex") if finite_number(quest.get("chapterIndex")) else None,
        "chapterNumber": quest.get("chapterNumber") if finite_number(quest.get("chapterNumber")) else None,
        "questSequenceIndex": quest.get("questSequenceIndex")
        if finite_number(quest.get("questSequenceIndex"))
        else None,
        "branchGroupKey": quest.get("branchGroupKey"),
        "branchLabel": quest.get("branchLabel"),
        "inferredFactionKey": quest.get("inferredFactionKey"),
        "inferredQuestLineKey": quest.get("inferredQuestLineKey"),
        "convergesIntoQuestKey": clean(quest.get("convergesIntoQuestKey")) or None,
        "previousQuestKeys": string_list(quest.get("previousQuestKeys")),
        "nextQuestKeys": string_list(quest.get("nextQuestKeys")),
        "referenceKeys": string_list(quest.get("referenceKeys")),
        "rootDialogBlockIdentities": string_list(quest.get("rootDialogBlockIdentities")),
        "choices": [
            normalize_choice(choice, choice_index)
            for choice_index, choice in enumerate(choices if isinstance(choices, list) else [])
            if isinstance(choice, dict)
        ],
    }


def quest_title(quest: dict[str, Any]) -> str:
    return clean(quest.get("displayName")) or clean(quest.get("questKey"))


def unique(values: list[Any]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []

    for value in values:
        cleaned = clean(value)
        if not cleaned or cleaned in seen:
            continue
        seen.add(cleaned)
        result.append(cleaned)

    return result


def collect_edges(quests: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], dict[str, list[str]]]:
    quest_keys = {quest["questKey"] for quest in quests}
    quests_by_key = {quest["questKey"]: quest for quest in quests}
    title_groups: dict[str, list[str]] = {}

    for quest in quests:
        title_groups.setdefault(quest_title(quest), []).append(quest["questKey"])

    edges: list[dict[str, Any]] = []

    def push_edge(quest: dict[str, Any], source: str, field: str, target_quest_key: Any) -> None:
        target = clean(target_quest_key)
        if not target:
            return

        target_quest = quests_by_key.get(target)
        target_title = quest_title(target_quest) if target_quest else target
        edges.append(
            {
                "sourceQuestKey": quest["questKey"],
                "source": source,
                "field": field,
                "targetQuestKey": target,
                "targetExists": target in quest_keys,
                "self": quest["questKey"] == target,
                "duplicateTitleTarget": len(title_groups.get(target_title, [])) > 1,
            }
        )

    for quest in quests:
        for target in quest["previousQuestKeys"]:
            push_edge(quest, "quest", "previousQuestKeys", target)
        for target in quest["nextQuestKeys"]:
            push_edge(quest, "quest", "nextQuestKeys", target)

        push_edge(quest, "quest", "convergesIntoQuestKey", quest["convergesIntoQuestKey"])

        for choice in quest["choices"]:
            for target in choice["nextQuestKeys"]:
                push_edge(quest, "choice", "choice.nextQuestKeys", target)
            for step in choice["steps"]:
                push_edge(quest, "step", "step.nextQuestKey", step["nextQuestKey"])
                push_edge(quest, "step", "step.failQuestKey", step["failQuestKey"])

    return edges, title_groups


def diagnose(quests: list[dict[str, Any]]) -> dict[str, Any]:
    edges, title_groups = collect_edges(quests)
    quest_next_edges = [edge for edge in edges if edge["field"] == "nextQuestKeys"]
    previous_edges = [edge for edge in edges if edge["field"] == "previousQuestKeys"]
    previous_reverse = {
        f"{edge['targetQuestKey']} -> {edge['sourceQuestKey']}"
        for edge in previous_edges
    }
    quest_next_pairs = {
        f"{edge['sourceQuestKey']} -> {edge['targetQuestKey']}"
        for edge in quest_next_edges
    }
    mismatches = []

    for quest in quests:
        quest_next_keys = unique(quest["nextQuestKeys"])
        interactive_next_keys = unique(
            [
                *[
                    target
                    for choice in quest["choices"]
                    for target in choice["nextQuestKeys"]
                ],
                *[
                    step["nextQuestKey"]
                    for choice in quest["choices"]
                    for step in choice["steps"]
                ],
            ]
        )
        quest_set = set(quest_next_keys)
        interactive_set = set(interactive_next_keys)
        quest_only_keys = [target for target in quest_next_keys if target not in interactive_set]
        interactive_only_keys = [target for target in interactive_next_keys if target not in quest_set]

        if quest_only_keys or interactive_only_keys:
            mismatches.append(
                {
                    "questKey": quest["questKey"],
                    "questOnlyKeys": quest_only_keys,
                    "interactiveOnlyKeys": interactive_only_keys,
                }
            )

    return {
        "questCount": len(quests),
        "edgeCount": len(edges),
        "danglingCount": len([edge for edge in edges if not edge["targetExists"]]),
        "duplicateTitleGroupCount": len(
            [quest_keys for quest_keys in title_groups.values() if len(quest_keys) > 1]
        ),
        "refsToDuplicateTitlesCount": len([edge for edge in edges if edge["duplicateTitleTarget"]]),
        "selfReferenceCount": len([edge for edge in edges if edge["self"]]),
        "questNextWithoutPreviousCount": len(
            [
                edge
                for edge in quest_next_edges
                if edge["targetExists"]
                and f"{edge['sourceQuestKey']} -> {edge['targetQuestKey']}" not in previous_reverse
            ]
        ),
        "previousWithoutQuestNextCount": len(
            [
                edge
                for edge in previous_edges
                if edge["targetExists"]
                and f"{edge['targetQuestKey']} -> {edge['sourceQuestKey']}" not in quest_next_pairs
            ]
        ),
        "questNextMismatchCount": len(mismatches),
        "convergeOverlapCount": len(
            [
                edge
                for edge in edges
                if edge["field"] == "convergesIntoQuestKey"
                and f"{edge['sourceQuestKey']} -> {edge['targetQuestKey']}" in quest_next_pairs
            ]
        ),
        "duplicateTitleExamples": [
            {"title": title, "count": len(quest_keys)}
            for title, quest_keys in sorted(
                (
                    (title, quest_keys)
                    for title, quest_keys in title_groups.items()
                    if len(quest_keys) > 1
                ),
                key=lambda item: (-len(item[1]), item[0]),
            )[:10]
        ],
        "mismatchExamples": mismatches[:10],
        "danglingExamples": [edge for edge in edges if not edge["targetExists"]][:10],
    }


def read_input(input_ref: str) -> Any:
    if input_ref.startswith(("http://", "https://")):
        with urllib.request.urlopen(input_ref) as response:
            return json.loads(response.read().decode("utf-8"))

    return json.loads(Path(input_ref).read_text(encoding="utf-8"))


def main() -> None:
    repo_root = Path(__file__).resolve().parents[2]
    default_input = repo_root / "local-imports" / "exports" / "ewshop_quest_graph_export_0.80.json"
    input_ref = sys.argv[1] if len(sys.argv) > 1 else str(default_input)
    payload = read_input(input_ref)
    quest_payload = payload if isinstance(payload, list) else payload.get("quests")

    if not isinstance(quest_payload, list):
        raise SystemExit("Expected a quest array or an object with quests[].")

    quests = [
        normalize_quest(quest, index)
        for index, quest in enumerate(quest_payload)
        if isinstance(quest, dict)
    ]
    print(json.dumps(diagnose(quests), indent=2))


if __name__ == "__main__":
    main()
