#!/usr/bin/env python3

from __future__ import annotations

import json
import re
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
    dialog_block_identities = string_list(step.get("dialogBlockIdentities"))
    dialog_block_refs = step.get("dialogBlockRefs")
    if not dialog_block_identities and isinstance(dialog_block_refs, list):
        dialog_block_identities = [
            "|".join(
                [
                    clean(ref.get("questKey")),
                    clean(ref.get("choiceKey")),
                    clean(ref.get("stepIndex")),
                    clean(ref.get("dialogKey")),
                    clean(ref.get("phase")),
                ]
            )
            for ref in dialog_block_refs
            if isinstance(ref, dict)
        ]

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
        "dialogBlockIdentities": dialog_block_identities,
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


THRESHOLD_PATTERNS = [
    re.compile(r":\s*\d+%"),
    re.compile(r"property requirement:\s*.+?=\s*\d+", re.IGNORECASE),
    re.compile(r"greaterorequal\s+\d+", re.IGNORECASE),
    re.compile(r"\{0\}"),
]


def threshold_like_line(line: str) -> bool:
    return any(pattern.search(line) for pattern in THRESHOLD_PATTERNS)


def step_condition_lines(step: dict[str, Any]) -> list[str]:
    return [
        *step["selectionPrerequisiteLines"],
        *step["completionPrerequisiteLines"],
        *step["failurePrerequisiteLines"],
        *step["forbiddenPrerequisiteLines"],
    ]


def equivalent_dialog_signature(step: dict[str, Any]) -> tuple[str, ...]:
    signatures = []

    for identity in step["dialogBlockIdentities"]:
        parts = identity.split("|")
        if len(parts) == 5:
            signatures.append("|".join([parts[0], parts[1], parts[3], parts[4]]))
        else:
            signatures.append(identity)

    return tuple(signatures)


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", clean(value).lower()).strip()


def line_signature(lines: list[str]) -> str:
    return "||".join(normalize_text(line) for line in string_list(lines))


def step_title(step: dict[str, Any]) -> str:
    return clean(step["objectiveText"]) or f"Step {step['stepIndex'] + 1}"


def normalize_requirement_family(line: str) -> str:
    text = normalize_text(line).replace("’", "'")
    label = text.split(":", 1)[0].strip()
    label = re.sub(r"\bdungeons\b", "dungeon", label)
    label = re.sub(r"\s+", " ", label)

    if ":" in text:
        return f"{label}:*"

    text = re.sub(r"\b\d+\b", "#", text)
    return re.sub(r"\b(?:my|target|candidate|quest|c\d+)[a-z0-9]*dungeon\b", "dungeon", text)


def requirement_family_signature(step: dict[str, Any]) -> str:
    return "::".join(
        [
            "||".join(normalize_requirement_family(line) for line in step["selectionPrerequisiteLines"]),
            "||".join(normalize_requirement_family(line) for line in step["completionPrerequisiteLines"]),
            "||".join(normalize_requirement_family(line) for line in step["failurePrerequisiteLines"]),
            "||".join(normalize_requirement_family(line) for line in step["forbiddenPrerequisiteLines"]),
        ]
    )


def requirement_exact_signature(step: dict[str, Any]) -> str:
    return "::".join(
        [
            line_signature(step["selectionPrerequisiteLines"]),
            line_signature(step["completionPrerequisiteLines"]),
            line_signature(step["failurePrerequisiteLines"]),
            line_signature(step["forbiddenPrerequisiteLines"]),
        ]
    )


def semantic_group_key(step: dict[str, Any]) -> tuple[Any, ...]:
    return (
        normalize_text(step_title(step)),
        clean(step["nextQuestKey"]),
        clean(step["failQuestKey"]),
        equivalent_dialog_signature(step),
    )


def objective_variant_cluster_key(step: dict[str, Any]) -> tuple[str, str, str]:
    return (
        line_signature(step["descriptionLines"]),
        line_signature(step["rewardDisplayLines"]),
        requirement_family_signature(step),
    )


def raw_placeholder_patterns(line: str) -> list[str]:
    patterns = [
        *re.findall(r"\{[^}]+\}", line),
        *re.findall(r"\b[A-Za-z0-9_]*_[A-Za-z0-9_]+\b", line),
        *re.findall(r"\b[A-Z][a-z]+[A-Z][A-Za-z0-9]*\b", line),
        *re.findall(r"\b(?:My|Target|Candidate|Quest|C\d+)[A-Za-z0-9]*\b", line),
        *re.findall(r"\b[A-Za-z0-9]+Definition\b", line),
    ]

    return unique(patterns)


def has_internal_placeholder(line: str) -> bool:
    return bool(raw_placeholder_patterns(line))


def has_resolved_count(line: str) -> bool:
    return bool(re.search(r":\s*\d+\b", line))


def step_display_quality(step: dict[str, Any]) -> float:
    score = 0.0
    for line in step_condition_lines(step):
        raw_penalty = 20 if has_internal_placeholder(line) else 0
        resolved_bonus = 8 if has_resolved_count(line) else 0
        score += raw_penalty - resolved_bonus + (len(clean(line)) / 100)
    return score


def select_display_representative(steps: list[dict[str, Any]]) -> dict[str, Any] | None:
    if not steps:
        return None

    return sorted(steps, key=lambda step: (step_display_quality(step), step["stepIndex"]))[0]


def has_display_variant_evidence(steps: list[dict[str, Any]]) -> bool:
    exact_requirement_signatures = {requirement_exact_signature(step) for step in steps}
    if len(exact_requirement_signatures) <= 1:
        return True

    lines = [line for step in steps for line in step_condition_lines(step)]
    return any(has_internal_placeholder(line) for line in lines) and any(has_resolved_count(line) for line in lines)


def build_step_semantic_groups(steps: list[dict[str, Any]]) -> list[dict[str, Any]]:
    buckets: dict[tuple[Any, ...], list[dict[str, Any]]] = {}
    for step in steps:
        buckets.setdefault(semantic_group_key(step), []).append(step)

    groups: list[dict[str, Any]] = []

    for group_steps in buckets.values():
        representative = group_steps[0] if group_steps else None
        if representative is None:
            continue

        is_progress_gate = (
            len(group_steps) > 1
            and all(clean(step["objectiveText"]) == clean(representative["objectiveText"]) for step in group_steps)
            and any(threshold_like_line(line) for step in group_steps for line in step_condition_lines(step))
        )

        if is_progress_gate:
            groups.append(
                {
                    "kind": "progressGate",
                    "title": step_title(representative),
                    "representativeStepIndex": representative["stepIndex"],
                    "stepIndexes": [step["stepIndex"] for step in group_steps],
                }
            )
            continue

        clusters: dict[tuple[str, str, str], list[dict[str, Any]]] = {}
        for step in group_steps:
            clusters.setdefault(objective_variant_cluster_key(step), []).append(step)

        for cluster_steps in clusters.values():
            if len(cluster_steps) > 1 and has_display_variant_evidence(cluster_steps):
                display_step = select_display_representative(cluster_steps)
                if display_step is None:
                    continue
                groups.append(
                    {
                        "kind": "objective",
                        "title": step_title(display_step),
                        "representativeStepIndex": display_step["stepIndex"],
                        "stepIndexes": [step["stepIndex"] for step in cluster_steps],
                    }
                )
                continue

            for step in cluster_steps:
                groups.append(
                    {
                        "kind": "objective",
                        "title": step_title(step),
                        "representativeStepIndex": step["stepIndex"],
                        "stepIndexes": [step["stepIndex"]],
                    }
                )

    return groups


def step_reward_signature(step: dict[str, Any]) -> str:
    return line_signature(step["rewardDisplayLines"])


def step_outcome_signature(step: dict[str, Any]) -> tuple[str, str]:
    return clean(step["nextQuestKey"]), clean(step["failQuestKey"])


def step_example(step: dict[str, Any]) -> dict[str, Any]:
    return {
        "stepIndex": step["stepIndex"],
        "completionLines": step["completionPrerequisiteLines"],
        "rewardLines": step["rewardDisplayLines"],
        "nextQuestKey": step["nextQuestKey"],
        "failQuestKey": step["failQuestKey"],
    }


def kept_separate_same_title_examples(quests: list[dict[str, Any]]) -> list[dict[str, Any]]:
    examples: list[dict[str, Any]] = []

    for quest in quests:
        for choice in quest["choices"]:
            steps_by_title: dict[str, list[dict[str, Any]]] = {}
            for step in choice["steps"]:
                steps_by_title.setdefault(step_title(step), []).append(step)

            for objective_text, steps in steps_by_title.items():
                if len(steps) <= 1:
                    continue

                reward_differs = len({step_reward_signature(step) for step in steps}) > 1
                outcome_differs = len({step_outcome_signature(step) for step in steps}) > 1
                if not reward_differs and not outcome_differs:
                    continue

                examples.append(
                    {
                        "questKey": quest["questKey"],
                        "title": quest_title(quest),
                        "choiceKey": choice["choiceKey"],
                        "objectiveText": objective_text,
                        "reason": (
                            "differentRewardAndOutcome"
                            if reward_differs and outcome_differs
                            else "differentReward"
                            if reward_differs
                            else "differentOutcome"
                        ),
                        "steps": [step_example(step) for step in steps],
                    }
                )

    return examples[:10]


def common_raw_placeholder_patterns(quests: list[dict[str, Any]]) -> list[dict[str, Any]]:
    counts: dict[str, dict[str, Any]] = {}

    for quest in quests:
        for choice in quest["choices"]:
            for step in choice["steps"]:
                for line in step_condition_lines(step):
                    for pattern in raw_placeholder_patterns(line):
                        current = counts.setdefault(pattern, {"count": 0, "examples": []})
                        current["count"] += 1
                        if line not in current["examples"] and len(current["examples"]) < 3:
                            current["examples"].append(line)

    return [
        {"pattern": pattern, "count": value["count"], "examples": value["examples"]}
        for pattern, value in sorted(counts.items(), key=lambda item: (-item[1]["count"], item[0]))[:10]
    ]


def objective_variant_diagnostics(quests: list[dict[str, Any]]) -> dict[str, Any]:
    total_step_groups_analyzed = 0
    collapsed_group_count = 0
    hidden_raw_step_count = 0
    affected_examples: list[dict[str, Any]] = []

    for quest in quests:
        for choice in quest["choices"]:
            steps_by_index = {step["stepIndex"]: step for step in choice["steps"]}
            semantic_groups = build_step_semantic_groups(choice["steps"])
            total_step_groups_analyzed += len(semantic_groups)

            for group in semantic_groups:
                if group["kind"] != "objective" or len(group["stepIndexes"]) <= 1:
                    continue

                representative_step = steps_by_index.get(group["representativeStepIndex"])
                raw_steps = [steps_by_index[index] for index in group["stepIndexes"] if index in steps_by_index]
                collapsed_group_count += 1
                hidden_raw_step_count += len(group["stepIndexes"]) - 1

                if representative_step is None or len(affected_examples) >= 10:
                    continue

                affected_examples.append(
                    {
                        "questKey": quest["questKey"],
                        "title": quest_title(quest),
                        "choiceKey": choice["choiceKey"],
                        "objectiveText": group["title"],
                        "representativeStepIndex": group["representativeStepIndex"],
                        "stepIndexes": group["stepIndexes"],
                        "hiddenStepIndexes": [
                            index for index in group["stepIndexes"] if index != group["representativeStepIndex"]
                        ],
                        "displayedCompletionLines": representative_step["completionPrerequisiteLines"],
                        "rawCompletionLines": unique(
                            [line for step in raw_steps for line in step["completionPrerequisiteLines"]]
                        ),
                    }
                )

    return {
        "totalStepGroupsAnalyzed": total_step_groups_analyzed,
        "collapsedDuplicateObjectiveVariantGroupCount": collapsed_group_count,
        "hiddenRawStepCount": hidden_raw_step_count,
        "affectedQuestExamples": affected_examples,
        "keptSeparateSameTitleExamples": kept_separate_same_title_examples(quests),
        "rawPlaceholderPatterns": common_raw_placeholder_patterns(quests),
    }


def repeated_objective_diagnostics(quests: list[dict[str, Any]]) -> dict[str, Any]:
    repeated_groups = []

    for quest in quests:
        for choice in quest["choices"]:
            by_objective: dict[str, list[dict[str, Any]]] = {}

            for step in choice["steps"]:
                by_objective.setdefault(clean(step["objectiveText"]) or f"Step {step['stepIndex']}", []).append(step)

            for objective, steps in by_objective.items():
                if len(steps) <= 1:
                    continue

                same_next = len({(step["nextQuestKey"], step["failQuestKey"]) for step in steps}) == 1
                same_dialog = len({equivalent_dialog_signature(step) for step in steps}) == 1
                threshold_like = any(
                    threshold_like_line(line)
                    for step in steps
                    for line in step_condition_lines(step)
                )

                repeated_groups.append(
                    {
                        "questKey": quest["questKey"],
                        "choiceKey": choice["choiceKey"],
                        "objectiveText": objective,
                        "stepCount": len(steps),
                        "sameNext": same_next,
                        "sameDialog": same_dialog,
                        "thresholdLike": threshold_like,
                    }
                )

    return {
        "repeatedObjectiveGroupCount": len(repeated_groups),
        "thresholdLikeRepeatedObjectiveGroupCount": len(
            [group for group in repeated_groups if group["thresholdLike"]]
        ),
        "sameNextAndDialogRepeatedObjectiveGroupCount": len(
            [group for group in repeated_groups if group["sameNext"] and group["sameDialog"]]
        ),
        "repeatedObjectiveExamples": sorted(
            repeated_groups,
            key=lambda group: (-group["stepCount"], group["questKey"], group["choiceKey"]),
        )[:10],
    }


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
    repeated_objectives = repeated_objective_diagnostics(quests)
    objective_variants = objective_variant_diagnostics(quests)
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
        **repeated_objectives,
        "objectiveVariantDiagnostics": objective_variants,
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
