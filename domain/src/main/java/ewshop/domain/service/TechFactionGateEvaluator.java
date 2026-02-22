package ewshop.domain.service;

import ewshop.domain.command.TechImportSnapshot;
import ewshop.domain.model.enums.MajorFaction;
import org.springframework.stereotype.Service;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

@Service
public class TechFactionGateEvaluator {

    private final Map<MajorFaction, Set<String>> factionTraits;
    private final EnumSet<MajorFaction> allowedMajorFactions;

    public TechFactionGateEvaluator(TechFactionTraitsProvider traitsProvider) {
        this.factionTraits = traitsProvider.getFactionTraits();
        this.allowedMajorFactions = traitsProvider.getAllowedFactions();
    }

    /**
     * Intended semantics:
     * - Operator "None": exclude factions that HAVE the trait (i.e. must NOT have it).
     * - Operator "Any": include factions that HAVE at least ONE of the "Any" traits (OR group).
     *
     * Combined rules:
     * - All "None" prereqs are enforced (fail if any forbidden trait is present).
     * - If there is at least one "Any" prereq, majorFaction must match at least one of them.
     * - Unknown operators fail closed.
     * - Blank/null trait keys are ignored.
     */
    public TechImportSnapshot withDerivedAvailableFactions(TechImportSnapshot s) {
        if (s.traitPrereqs() == null || s.traitPrereqs().isEmpty()) {
            return s.withAvailableFactions(allowedMajorFactions);
        }

        EnumSet<MajorFaction> passing = EnumSet.noneOf(MajorFaction.class);
        for (MajorFaction f : allowedMajorFactions) {
            Set<String> traits = factionTraits.getOrDefault(f, Set.of());
            if (passesTraitGate(s, traits)) {
                passing.add(f);
            }
        }

        return s.withAvailableFactions(passing);
    }

    private boolean passesTraitGate(TechImportSnapshot s, Set<String> traits) {
        boolean hasAnyGroup = false;
        boolean anyMatched = false;

        for (var p : s.traitPrereqs()) {
            if (p == null) continue;

            String rawKey = p.traitKey();
            if (rawKey == null) continue;

            String key = rawKey.trim();
            if (key.isEmpty()) continue;

            String op = p.operator() == null ? "" : p.operator().trim();
            boolean hasTrait = traits.contains(key);

            // "None" => must NOT have trait (exclude list)
            if ("None".equalsIgnoreCase(op)) {
                if (hasTrait) return false;
                continue;
            }

            // "Any" => OR group: must match at least one of these, if any exist
            if ("Any".equalsIgnoreCase(op)) {
                hasAnyGroup = true;
                if (hasTrait) anyMatched = true;
                continue;
            }

            // fail closed on unknown operators (including blank)
            return false;
        }

        // If there were Any-prereqs, require at least one match
        return !hasAnyGroup || anyMatched;
    }
}