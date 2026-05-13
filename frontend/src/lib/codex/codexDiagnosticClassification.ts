import type { DescriptionTokenDiagnostic } from "@/lib/descriptionLine/descriptionDiagnostics";
import type { CodexReferenceDiagnostic } from "./codexReferenceDiagnostics";

export type CodexDiagnosticSeverity = "warning" | "low" | "info";

export type CodexDiagnosticClassification =
    | {
          severity: "warning";
          bucket: "high-signal-warning";
          label: "user-facing unresolved reference";
          ignoredCandidate: false;
      }
    | {
          severity: "low";
          bucket: "token-vocabulary-gap";
          label: "token vocabulary gap";
          ignoredCandidate: false;
      }
    | {
          severity: "info";
          bucket: "expected-internal-noise";
          label: "expected internal/mechanical reference";
          ignoredCandidate: true;
      }
    | {
          severity: "info";
          bucket: "expected-style-token";
          label: "expected style token";
          ignoredCandidate: true;
      }
    | {
          severity: "info";
          bucket: "other";
          label: "other diagnostic";
          ignoredCandidate: false;
      };

const MECHANICAL_REFERENCE_PATTERNS = [
    /^UnitAbility_Class_.*Tag$/i,
    /^UnitAbility_LandMovement$/i,
    /^UnitAbility_Hero_.*Trad$/i,
    /^UnitAbility_Hero_BattleAbility_Equipment_/i,
];

const USER_FACING_REFERENCE_PATTERNS = [
    /^Unit_/i,
    /^DistrictImprovement_/i,
    /^District_/i,
    /^Technology_/i,
    /^MinorFaction_/i,
    /^Faction_/i,
    /^Population_/i,
];

const TOKEN_VOCABULARY_GAPS = new Set([
    "damage",
    "health",
    "defense",
    "movementpoints",
    "visionrange",
    "attackrange",
    "doublearrow",
]);

function matchesAny(value: string, patterns: readonly RegExp[]) {
    return patterns.some((pattern) => pattern.test(value));
}

export function classifyCodexReferenceDiagnostic(
    diagnostic: Pick<CodexReferenceDiagnostic, "kind" | "raw">
): CodexDiagnosticClassification {
    const raw = diagnostic.raw.trim();

    if (matchesAny(raw, MECHANICAL_REFERENCE_PATTERNS)) {
        return {
            severity: "info",
            bucket: "expected-internal-noise",
            label: "expected internal/mechanical reference",
            ignoredCandidate: true,
        };
    }

    if (
        (diagnostic.kind === "unresolved-ref" || diagnostic.kind === "unresolved-imported-domain-ref") &&
        matchesAny(raw, USER_FACING_REFERENCE_PATTERNS)
    ) {
        return {
            severity: "warning",
            bucket: "high-signal-warning",
            label: "user-facing unresolved reference",
            ignoredCandidate: false,
        };
    }

    return {
        severity: "info",
        bucket: "other",
        label: "other diagnostic",
        ignoredCandidate: false,
    };
}

export function classifyDescriptionTokenDiagnostic(
    diagnostic: Pick<DescriptionTokenDiagnostic, "kind" | "token" | "raw">
): CodexDiagnosticClassification {
    const token = (diagnostic.token || diagnostic.raw).trim().toLowerCase();

    if (diagnostic.kind === "known-style-token") {
        return {
            severity: "info",
            bucket: "expected-style-token",
            label: "expected style token",
            ignoredCandidate: true,
        };
    }

    if (TOKEN_VOCABULARY_GAPS.has(token)) {
        return {
            severity: "low",
            bucket: "token-vocabulary-gap",
            label: "token vocabulary gap",
            ignoredCandidate: false,
        };
    }

    return {
        severity: "info",
        bucket: "other",
        label: "other diagnostic",
        ignoredCandidate: false,
    };
}
