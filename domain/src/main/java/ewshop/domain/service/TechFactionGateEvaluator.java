package ewshop.domain.service;

import ewshop.domain.command.TechImportSnapshot;
import ewshop.domain.model.enums.Faction;
import org.springframework.stereotype.Service;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

@Service
public class TechFactionGateEvaluator {

    private final Map<Faction, Set<String>> factionTraits;
    private final EnumSet<Faction> allowedFactions;

    public TechFactionGateEvaluator(TechFactionTraitsProvider traitsProvider) {
        this.factionTraits = traitsProvider.getFactionTraits();
        this.allowedFactions = traitsProvider.getAllowedFactions();
    }

    public TechImportSnapshot withDerivedAvailableFactions(TechImportSnapshot s) {
        if (s.traitPrereqs() == null || s.traitPrereqs().isEmpty()) {
            return s.withAvailableFactions(allowedFactions);
        }

        EnumSet<Faction> passing = EnumSet.noneOf(Faction.class);
        for (Faction f : allowedFactions) {
            Set<String> traits = factionTraits.getOrDefault(f, Set.of());
            if (passesAllTraitPrereqs(s, traits)) passing.add(f);
        }

        return s.withAvailableFactions(passing);
    }

    private boolean passesAllTraitPrereqs(TechImportSnapshot s, Set<String> traits) {
        for (var p : s.traitPrereqs()) {
            if (p == null || p.traitKey() == null || p.traitKey().isBlank()) continue;

            boolean has = traits.contains(p.traitKey().trim());
            String op = p.operator() == null ? "" : p.operator().trim();

            if ("Any".equalsIgnoreCase(op) && !has) return false;
            if ("None".equalsIgnoreCase(op) && has) return false;

            // fail closed
            if (!"Any".equalsIgnoreCase(op) && !"None".equalsIgnoreCase(op)) return false;
        }
        return true;
    }
}