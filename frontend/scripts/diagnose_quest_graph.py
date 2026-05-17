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
    root_dialog_block_identities = string_list(quest.get("rootDialogBlockIdentities"))
    dialog_block_refs = quest.get("dialogBlockRefs")
    if not root_dialog_block_identities and isinstance(dialog_block_refs, list):
        root_dialog_block_identities = [
            "|".join(
                [
                    clean(ref.get("questKey")),
                    "",
                    "",
                    clean(ref.get("dialogKey")),
                    clean(ref.get("phase")),
                ]
            )
            for ref in dialog_block_refs
            if isinstance(ref, dict)
        ]

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
        "rootDialogBlockIdentities": root_dialog_block_identities,
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


def humanize_key(key: str) -> str:
    words = re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", clean(key))
    tokens = [token for token in re.split(r"[^A-Za-z0-9]+", words) if token]
    return " ".join(token if token.isupper() and len(token) <= 4 else token[:1].upper() + token[1:].lower() for token in tokens)


def raw_internal_label(label: str, key: str | None = None) -> bool:
    text = clean(label)
    return bool(
        text
        and (
            text == clean(key)
            or re.search(r"[_{}]", text)
            or re.search(r"\b[A-Za-z0-9]+Definition\b", text)
        )
    )


def raw_display_name_diagnostics(quests: list[dict[str, Any]]) -> dict[str, Any]:
    quest_examples = []
    choice_examples = []
    quest_count = 0
    choice_count = 0

    for quest in quests:
        display_name = clean(quest.get("displayName"))
        if raw_internal_label(display_name, quest["questKey"]):
            quest_count += 1
            if len(quest_examples) < 10:
                quest_examples.append({"questKey": quest["questKey"], "displayName": display_name})

        for choice in quest["choices"]:
            choice_display_name = clean(choice.get("displayName"))
            if raw_internal_label(choice_display_name, choice["choiceKey"]):
                choice_count += 1
                if len(choice_examples) < 10:
                    choice_examples.append(
                        {
                            "questKey": quest["questKey"],
                            "choiceKey": choice["choiceKey"],
                            "displayName": choice_display_name,
                        }
                    )

    return {
        "questDisplayNameCount": quest_count,
        "choiceDisplayNameCount": choice_count,
        "questExamples": quest_examples,
        "choiceExamples": choice_examples,
    }


def objective_text_diagnostics(quests: list[dict[str, Any]]) -> dict[str, Any]:
    blank_count = 0
    spacing_count = 0
    examples = []

    for quest in quests:
        for choice in quest["choices"]:
            for step in choice["steps"]:
                objective = clean(step.get("objectiveText"))
                issue = "blank" if not objective else "spacing" if re.search(r"\s{2,}", step.get("objectiveText") or "") else None
                if issue is None:
                    continue

                if issue == "blank":
                    blank_count += 1
                else:
                    spacing_count += 1
                if len(examples) < 10:
                    examples.append(
                        {
                            "questKey": quest["questKey"],
                            "title": quest_title(quest),
                            "choiceKey": choice["choiceKey"],
                            "stepIndex": step["stepIndex"],
                            "objectiveText": objective or None,
                            "issue": issue,
                        }
                    )

    return {
        "blankObjectiveCount": blank_count,
        "spacingCorruptObjectiveCount": spacing_count,
        "examples": examples,
    }


def dialog_coverage_diagnostics(quests: list[dict[str, Any]]) -> dict[str, Any]:
    root_refs = 0
    step_refs = 0
    quests_with_root = 0
    quests_with_any = 0
    steps_with_dialog = 0
    steps_without_dialog = 0

    for quest in quests:
        root_count = len(quest.get("rootDialogBlockIdentities", []))
        root_refs += root_count
        if root_count:
            quests_with_root += 1

        has_any = root_count > 0
        for choice in quest["choices"]:
            for step in choice["steps"]:
                step_count = len(step.get("dialogBlockIdentities", []))
                step_refs += step_count
                if step_count:
                    steps_with_dialog += 1
                    has_any = True
                else:
                    steps_without_dialog += 1
        if has_any:
            quests_with_any += 1

    return {
        "rootDialogReferenceCount": root_refs,
        "stepDialogReferenceCount": step_refs,
        "questsWithRootDialogCount": quests_with_root,
        "questsWithoutRootDialogCount": len(quests) - quests_with_root,
        "questsWithAnyDialogCount": quests_with_any,
        "questsWithoutAnyDialogCount": len(quests) - quests_with_any,
        "stepsWithDialogCount": steps_with_dialog,
        "stepsWithoutDialogCount": steps_without_dialog,
    }


def outcome_keys(quest: dict[str, Any]) -> list[str]:
    return unique(
        [
            *quest["nextQuestKeys"],
            quest["convergesIntoQuestKey"],
            *[
                target
                for choice in quest["choices"]
                for target in [
                    *choice["nextQuestKeys"],
                    *[step["nextQuestKey"] for step in choice["steps"]],
                    *[step["failQuestKey"] for step in choice["steps"]],
                ]
            ],
        ]
    )


def category_label(quest: dict[str, Any]) -> str:
    return clean(quest.get("categoryType")) or humanize_key(clean(quest.get("categoryKey")) or "Uncategorized")


def no_outcome_diagnostics(quests: list[dict[str, Any]]) -> dict[str, Any]:
    no_outcome_quests = [quest for quest in quests if not outcome_keys(quest)]
    counts: dict[str, int] = {}
    for quest in no_outcome_quests:
        counts[category_label(quest)] = counts.get(category_label(quest), 0) + 1

    return {
        "questCount": len(no_outcome_quests),
        "byCategory": [
            {"category": category, "count": count}
            for category, count in sorted(counts.items(), key=lambda item: (-item[1], item[0]))
        ],
        "examples": [
            {"questKey": quest["questKey"], "title": quest_title(quest), "category": category_label(quest)}
            for quest in no_outcome_quests[:10]
        ],
    }


def compact_entity_label(value: Any) -> str | None:
    label = clean(value)
    if not label:
        return None
    return (
        humanize_key(label)
        .removeprefix("Faction ")
        .removeprefix("Faction Quest ")
        .removeprefix("Quest Line ")
        .strip()
    )


def generic_path_label(label: str) -> bool:
    return bool(re.match(r"^(?:choice|branch|path)\s+[0-9a-z]+$", clean(label), re.IGNORECASE))


def redundant_label(label: str, compare_with: str | None) -> bool:
    return bool(normalize_text(label) and normalize_text(label) == normalize_text(compare_with or ""))


def raw_branch_context_label(quest: dict[str, Any]) -> str | None:
    branch_label = clean(quest.get("branchLabel"))
    if branch_label and not generic_path_label(branch_label) and not redundant_label(branch_label, quest_title(quest)):
        return branch_label

    branch_group_label = compact_entity_label(quest.get("branchGroupKey"))
    if branch_group_label and not generic_path_label(branch_group_label) and not redundant_label(branch_group_label, quest_title(quest)):
        return branch_group_label

    return None


def noisy_branch_facet_label(label: str) -> bool:
    normalized = re.sub(r"[^a-z0-9]+", " ", normalize_text(label)).strip()
    return bool(
        re.match(r"^path \d+[a-z]?$", normalized)
        or re.match(r"^quest .*\bchapter ?\d+[a-z]?\b", normalized)
        or re.match(r"^quest .*\bstep ?\d+\b", normalized)
        or re.match(r"^quest .*\bchoice ?\d+\b", normalized)
    )


def noisy_branch_facet_diagnostics(quests: list[dict[str, Any]]) -> dict[str, Any]:
    labels: dict[str, dict[str, Any]] = {}
    for quest in quests:
        label = raw_branch_context_label(quest)
        if not label or not noisy_branch_facet_label(label):
            continue
        current = labels.setdefault(label, {"count": 0, "examples": []})
        current["count"] += 1
        if quest["questKey"] not in current["examples"] and len(current["examples"]) < 3:
            current["examples"].append(quest["questKey"])

    sorted_labels = [
        {"label": label, "count": value["count"], "examples": value["examples"]}
        for label, value in sorted(labels.items(), key=lambda item: (-item[1]["count"], item[0]))
    ]
    return {"labelCount": len(sorted_labels), "labels": sorted_labels[:10]}


PLAYER_STANCE_LABELS = ["Pious", "Open", "Bold"]


def stance_label(value: str | None) -> str | None:
    text = clean(value).lower()
    return next((label for label in PLAYER_STANCE_LABELS if re.search(rf"\b{label.lower()}\b", text)), None)


def choice_title(choice: dict[str, Any], index: int) -> str:
    return clean(choice.get("displayName")) or humanize_key(choice["choiceKey"]) or f"Choice {index + 1}"


def effect_choice(choice: dict[str, Any]) -> bool:
    return bool(re.search(r"EffectChoiceDefinition$", clean(choice["choiceKey"]), re.IGNORECASE))


def user_facing_choice_signature(choice: dict[str, Any]) -> str:
    def step_signature(step: dict[str, Any]) -> str:
        return "::".join(
            [
                normalize_text(step["objectiveText"]),
                line_signature(step["descriptionLines"]),
                line_signature(step["selectionPrerequisiteLines"]),
                line_signature(step["completionPrerequisiteLines"]),
                line_signature(step["failurePrerequisiteLines"]),
                line_signature(step["forbiddenPrerequisiteLines"]),
                line_signature(step["rewardDisplayLines"]),
                clean(step["nextQuestKey"]),
                clean(step["failQuestKey"]),
            ]
        )

    return "::".join(
        [
            normalize_text(choice.get("displayName")),
            line_signature(choice["descriptionLines"]),
            line_signature(choice["completionPrerequisiteLines"]),
            line_signature(choice["failurePrerequisiteLines"]),
            line_signature(choice["rewardDisplayLines"]),
            "|".join(choice["nextQuestKeys"]),
            "||".join(step_signature(step) for step in choice["steps"]),
        ]
    )


def user_facing_choice_score(choice: dict[str, Any]) -> int:
    def has_objective(step: dict[str, Any]) -> bool:
        return bool(clean(step["objectiveText"]) or step["descriptionLines"])

    def has_requirements(step: dict[str, Any]) -> bool:
        return bool(step_condition_lines(step))

    def has_dialog(step: dict[str, Any]) -> bool:
        return bool(step.get("dialogBlockIdentities"))

    return (
        len([step for step in choice["steps"] if has_objective(step)]) * 20
        + len([step for step in choice["steps"] if has_requirements(step)]) * 8
        + len([step for step in choice["steps"] if has_dialog(step)]) * 30
        + len(choice["rewardDisplayLines"]) * 6
    )


def user_facing_choices(choices: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_signature: dict[str, dict[str, Any]] = {}
    ordered_signatures: list[str] = []

    for choice in choices:
        if effect_choice(choice):
            continue

        signature = user_facing_choice_signature(choice)
        score = user_facing_choice_score(choice)
        existing = by_signature.get(signature)
        if existing is None:
            ordered_signatures.append(signature)
            by_signature[signature] = {"choice": choice, "score": score}
            continue
        if score > existing["score"]:
            by_signature[signature] = {"choice": choice, "score": score}

    return [by_signature[signature]["choice"] for signature in ordered_signatures]


def choice_number(choice_key: str) -> int | None:
    match = re.search(r"Choice0*([0-9]+)", clean(choice_key), re.IGNORECASE)
    if not match:
        return None
    return int(match.group(1))


def quests_by_key(quests: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    return {quest["questKey"]: quest for quest in quests}


def effect_choice_path_labels(quest: dict[str, Any], quest_lookup: dict[str, dict[str, Any]]) -> dict[int, str]:
    labels: dict[int, str] = {}
    for choice in quest["choices"]:
        if not effect_choice(choice):
            continue
        number = choice_number(choice["choiceKey"])
        if number is None or number in labels:
            continue
        target_labels = [
            stance_label(quest_title(target)) or quest_title(target)
            for target in [quest_lookup.get(clean(key)) for key in choice["nextQuestKeys"]]
            if target
        ]
        target_labels = [
            label
            for label in target_labels
            if label and not redundant_label(label, quest_title(quest)) and not generic_path_label(label)
        ]
        semantic_label = next((label for label in target_labels if stance_label(label)), None) or (
            target_labels[0] if target_labels else None
        )
        if semantic_label:
            labels[number] = semantic_label
    return labels


def next_quest_labels(choice: dict[str, Any], quest: dict[str, Any], quest_lookup: dict[str, dict[str, Any]]) -> list[str]:
    return unique(
        [
            quest_title(target)
            for target in [quest_lookup.get(clean(key)) for key in choice["nextQuestKeys"]]
            if target
            and not redundant_label(quest_title(target), quest_title(quest))
            and not generic_path_label(quest_title(target))
        ]
    )


def classify_choice_title(
    quest: dict[str, Any],
    choice: dict[str, Any],
    index: int,
    visible_choice_count: int,
    quest_lookup: dict[str, dict[str, Any]],
    effect_labels: dict[int, str],
) -> dict[str, Any]:
    raw_title = choice_title(choice, index)
    stance = stance_label(raw_title)
    if stance:
        return {"rawTitle": raw_title, "projectedTitle": stance, "reason": "stance"}

    if (
        not redundant_label(raw_title, quest_title(quest))
        and not generic_path_label(raw_title)
        and not raw_internal_label(raw_title, choice["choiceKey"])
    ):
        return {"rawTitle": raw_title, "projectedTitle": raw_title, "reason": "sourceTitle"}

    number = choice_number(choice["choiceKey"])
    if number is not None and number in effect_labels:
        return {"rawTitle": raw_title, "projectedTitle": effect_labels[number], "reason": "effectOutcome"}

    targets = next_quest_labels(choice, quest, quest_lookup)
    if len(targets) == 1:
        return {"rawTitle": raw_title, "projectedTitle": targets[0], "reason": "nextOutcome"}

    return {
        "rawTitle": raw_title,
        "projectedTitle": None if visible_choice_count == 1 else f"Path {chr(ord('A') + index)}",
        "reason": "suppressedSinglePathFallback" if visible_choice_count == 1 else "fallback",
    }


def choice_title_diagnostics(quests: list[dict[str, Any]]) -> dict[str, Any]:
    lookup = quests_by_key(quests)
    visible_count = 0
    rewritten_count = 0
    fallback_count = 0
    suppressed_count = 0
    reasons: dict[str, int] = {}
    examples = []

    for quest in quests:
        visible_choices = user_facing_choices(quest["choices"])
        effect_labels = effect_choice_path_labels(quest, lookup)
        visible_count += len(visible_choices)

        for index, choice in enumerate(visible_choices):
            decision = classify_choice_title(quest, choice, index, len(visible_choices), lookup, effect_labels)
            reasons[decision["reason"]] = reasons.get(decision["reason"], 0) + 1
            if decision["projectedTitle"] != decision["rawTitle"]:
                rewritten_count += 1
                if len(examples) < 10:
                    examples.append(
                        {
                            "questKey": quest["questKey"],
                            "choiceKey": choice["choiceKey"],
                            **decision,
                        }
                    )
            if decision["reason"] == "fallback":
                fallback_count += 1
            if decision["reason"] == "suppressedSinglePathFallback":
                suppressed_count += 1

    return {
        "visibleChoiceCount": visible_count,
        "rewrittenTitleCount": rewritten_count,
        "fallbackTitleCount": fallback_count,
        "suppressedSinglePathTitleCount": suppressed_count,
        "reasonCounts": [
            {"reason": reason, "count": count}
            for reason, count in sorted(reasons.items(), key=lambda item: (-item[1], item[0]))
        ],
        "examples": examples,
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
        "rawDisplayNameDiagnostics": raw_display_name_diagnostics(quests),
        "objectiveTextDiagnostics": objective_text_diagnostics(quests),
        "dialogCoverageDiagnostics": dialog_coverage_diagnostics(quests),
        "noOutcomeDiagnostics": no_outcome_diagnostics(quests),
        "noisyBranchFacetDiagnostics": noisy_branch_facet_diagnostics(quests),
        "choiceTitleDiagnostics": choice_title_diagnostics(quests),
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
