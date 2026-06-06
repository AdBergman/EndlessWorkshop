package ewshop.domain.service;

import ewshop.domain.command.TechImportSnapshot;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

@Service
public class TechFactionGateEvaluator {

    private final Map<String, Set<String>> factionTraits;
    private final Set<String> allowedMajorFactions;

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
        return withDerivedAvailableFactions(s, Set.of());
    }

    public TechImportSnapshot withDerivedAvailableFactions(TechImportSnapshot s, Set<String> additionalMajorFactions) {
        Set<String> candidateFactions = candidateFactions(additionalMajorFactions);

        if (s.traitPrereqs() == null || s.traitPrereqs().isEmpty()) {
            if (s.factionDisplayName() != null) {
                return s.withAvailableFactions(Set.of(s.factionDisplayName()));
            }
            return s.withAvailableFactions(candidateFactions);
        }

        Set<String> passing = new LinkedHashSet<>();
        for (String f : candidateFactions) {
            Set<String> traits = factionTraits.getOrDefault(f, Set.of());
            if (passesTraitGate(s, traits)) {
                passing.add(f);
            }
        }

        if (passing.isEmpty() && s.factionDisplayName() != null && hasOnlyAnyTraitPrerequisites(s)) {
            passing.add(s.factionDisplayName());
        }

        return s.withAvailableFactions(passing);
    }

    private Set<String> candidateFactions(Set<String> additionalMajorFactions) {
        LinkedHashSet<String> candidates = new LinkedHashSet<>(allowedMajorFactions);
        if (additionalMajorFactions != null) {
            additionalMajorFactions.stream()
                    .filter(faction -> faction != null && !faction.isBlank())
                    .map(String::trim)
                    .forEach(candidates::add);
        }
        return candidates;
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

    private boolean hasOnlyAnyTraitPrerequisites(TechImportSnapshot s) {
        boolean foundAny = false;
        for (var p : s.traitPrereqs()) {
            if (p == null || p.traitKey() == null || p.traitKey().isBlank()) continue;
            if (!"Any".equalsIgnoreCase(p.operator() == null ? "" : p.operator().trim())) return false;
            foundAny = true;
        }
        return foundAny;
    }
}
