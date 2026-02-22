package ewshop.domain.service;

import ewshop.domain.model.enums.MajorFaction;
import org.springframework.stereotype.Component;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

@Component
public class TechFactionTraitsProvider {

    public EnumSet<MajorFaction> getAllowedFactions() {
        return EnumSet.of(
                MajorFaction.KIN,
                MajorFaction.ASPECTS,
                MajorFaction.LORDS,
                MajorFaction.NECROPHAGES,
                MajorFaction.TAHUK
        );
    }

    /**
     * - Keep this limited to *trait/affinity* keys used in prereqs.
     * - Quest-related trait keys intentionally omitted.
     * - Includes a few aliases (old vs new naming) to avoid exporter naming drift causing missing techs.
     */
    public Map<MajorFaction, Set<String>> getFactionTraits() {
        return Map.of(
                MajorFaction.KIN, Set.of(
                        "FactionAffinity_KinOfSheredyn",
                        "FactionTrait_KinOfSheredyn_Units",
                        "FactionTrait_KinOfSheredyn_Chosen"
                ),
                MajorFaction.ASPECTS, Set.of(
                        "FactionAffinity_Aspect",
                        "FactionTrait_Aspects_Units",
                        "FactionTrait_Aspects_Hippie",
                        "FactionTrait_Aspects_UnlockTech_ForceDiplomacy",

                        // alias (older naming seen in some earlier data)
                        "FactionTrait_Aspect_Units"
                ),
                MajorFaction.LORDS, Set.of(
                        "FactionAffinity_LastLord",
                        "FactionTrait_LastLord_Units",

                        // alias (older naming seen in some earlier data)
                        "FactionAffinity_Lords",
                        "FactionTrait_Lords_Units"
                ),
                MajorFaction.NECROPHAGES, Set.of(
                        "FactionAffinity_Necrophage",
                        "FactionTrait_Necrophage_Units",
                        "FactionTrait_Necrophage_NoDiplomacy"
                ),
                MajorFaction.TAHUK, Set.of(
                        "FactionAffinity_Mukag",
                        "FactionTrait_Mukag_Units"

                        // (Quest-related Mukag/Tahuk traits intentionally omitted)
                )
        );
    }
}