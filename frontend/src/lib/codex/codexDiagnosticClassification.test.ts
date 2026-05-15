import {
    classifyCodexReferenceDiagnostic,
    classifyDescriptionTokenDiagnostic,
} from "./codexDiagnosticClassification";

describe("codexDiagnosticClassification", () => {
    it("classifies mechanical ability references as expected internal noise", () => {
        [
            "UnitAbility_Class_RangedTag",
            "UnitAbility_LandMovement",
            "UnitAbility_Hero_StrengthTrad",
            "UnitAbility_Hero_BattleAbility_Equipment_Passive_08",
        ].forEach((raw) => {
            expect(classifyCodexReferenceDiagnostic({ kind: "raw-fallback-ref", raw })).toMatchObject({
                bucket: "expected-internal-noise",
                severity: "info",
                ignoredCandidate: true,
            });
        });
    });

    it("classifies unresolved user-facing entity references as warnings", () => {
        [
            "Unit_Missing",
            "DistrictImprovement_Missing",
            "District_Missing",
            "Technology_Missing",
            "MinorFaction_Missing",
            "Faction_Missing",
            "FactionQuest_Missing",
            "Population_Missing",
            "Trait_Missing",
        ].forEach((raw) => {
            expect(classifyCodexReferenceDiagnostic({ kind: "unresolved-ref", raw })).toMatchObject({
                bucket: "high-signal-warning",
                severity: "warning",
                ignoredCandidate: false,
            });
        });
    });

    it("does not promote resolved raw fallback entity refs to warnings", () => {
        expect(
            classifyCodexReferenceDiagnostic({ kind: "raw-fallback-ref", raw: "Unit_ResolvedByRawKey" })
        ).toMatchObject({
            bucket: "other",
            severity: "info",
        });
    });

    it("classifies common stat and formatting tokens as low severity vocabulary gaps", () => {
        ["Damage", "Health", "Defense", "MovementPoints", "VisionRange", "AttackRange", "DoubleArrow"].forEach(
            (token) => {
                expect(classifyDescriptionTokenDiagnostic({ kind: "unknown-token", token, raw: `[${token}]` }))
                    .toMatchObject({
                        bucket: "token-vocabulary-gap",
                        severity: "low",
                        ignoredCandidate: false,
                    });
            }
        );
    });

    it("classifies known style tokens as expected style noise", () => {
        expect(
            classifyDescriptionTokenDiagnostic({
                kind: "known-style-token",
                token: "DustColored",
                raw: "[DustColored]",
            })
        ).toMatchObject({
            bucket: "expected-style-token",
            severity: "info",
            ignoredCandidate: true,
        });
    });
});
