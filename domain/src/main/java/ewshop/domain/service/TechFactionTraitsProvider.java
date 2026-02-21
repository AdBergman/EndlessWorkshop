package ewshop.domain.service;

import ewshop.domain.model.enums.Faction;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

@Component
public class TechFactionTraitsProvider {

    public EnumSet<Faction> getAllowedFactions() {
        return EnumSet.of(
                Faction.KIN,
                Faction.ASPECTS,
                Faction.LORDS,
                Faction.NECROPHAGES,
                Faction.TAHUK
        );
    }

    public Map<Faction, Set<String>> getFactionTraits() {
        return Map.of(
                Faction.KIN, Set.of(
                        "FactionAffinity_KinOfSheredyn",
                        "FactionTrait_KinOfSheredyn_Units"
                ),
                Faction.ASPECTS, Set.of(
                        "FactionAffinity_Aspect",
                        "FactionTrait_Aspect_Units"
                ),
                Faction.LORDS, Set.of(
                        "FactionAffinity_Lords",
                        "FactionAffinity_LastLord",
                        "FactionTrait_Lords_Units"
                ),
                Faction.NECROPHAGES, Set.of(
                        "FactionAffinity_Necrophage",
                        "FactionTrait_Necrophage_Units"
                ),
                Faction.TAHUK, Set.of(
                        "FactionAffinity_Mukag",
                        "FactionTrait_Mukag_Units"
                )
        );
    }
}