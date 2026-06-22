package ewshop.facade.mapper;

import ewshop.domain.command.SkillImportSnapshot;
import ewshop.facade.dto.importing.skills.*;

import java.util.List;
import java.util.Map;

public final class SkillImportMapper {

    private SkillImportMapper() {}

    public static SkillImportSnapshot toSnapshot(SkillImportBatchDto dto) {
        if (dto == null) throw new IllegalArgumentException("Import file is required");

        return new SkillImportSnapshot(
                cleanTrees(dto.skillTrees()),
                cleanTiers(dto.skillTiers()),
                cleanSkills(dto.skills()),
                cleanDefaults(dto.heroSkillDefaults())
        );
    }

    private static List<SkillImportSnapshot.SkillTreeSnapshot> cleanTrees(List<SkillImportTreeDto> values) {
        if (values == null || values.isEmpty()) return List.of();
        return values.stream()
                .filter(value -> value != null)
                .map(value -> new SkillImportSnapshot.SkillTreeSnapshot(
                        value.treeKey(),
                        value.treeType(),
                        value.isHidden(),
                        value.tierPlacementKeys(),
                        value.tierKeys(),
                        value.skillKeys(),
                        value.referenceKeys(),
                        value.classPrerequisiteKey(),
                        value.factionPrerequisiteKey()
                ))
                .toList();
    }

    private static List<SkillImportSnapshot.SkillTierSnapshot> cleanTiers(List<SkillImportTierDto> values) {
        if (values == null || values.isEmpty()) return List.of();
        return values.stream()
                .filter(value -> value != null)
                .map(value -> new SkillImportSnapshot.SkillTierSnapshot(
                        value.tierPlacementKey(),
                        value.tierKey(),
                        value.treeKey(),
                        value.treeType(),
                        value.tierIndex(),
                        value.levelPrerequisite(),
                        value.skillKeys(),
                        value.referenceKeys()
                ))
                .toList();
    }

    private static List<SkillImportSnapshot.HeroSkillSnapshot> cleanSkills(List<SkillImportSkillDto> values) {
        if (values == null || values.isEmpty()) return List.of();
        return values.stream()
                .filter(value -> value != null)
                .map(value -> new SkillImportSnapshot.HeroSkillSnapshot(
                        value.skillKey(),
                        value.entryKey(),
                        value.kind(),
                        value.displayName(),
                        value.publicDisplayName(),
                        value.primaryAbilityKey(),
                        value.descriptionLines(),
                        value.resolvedDisplayName(),
                        value.resolvedSummaryLines(),
                        value.resolvedMechanicKind(),
                        value.resolvedMechanicTags(),
                        value.isObsolete(),
                        value.isActive(),
                        value.isPassive(),
                        copyMaps(value.placements()),
                        value.prerequisiteSkillKeys(),
                        value.inhibitedBySkillKeys(),
                        value.lockedBySkillKeys(),
                        copyMaps(value.effects()),
                        value.unitAbilityKeys(),
                        value.battleSkillKeys(),
                        value.battleAbilityKeys(),
                        value.descriptorKeys(),
                        value.unitAbilityEventKeys(),
                        value.rewardPerKillInBattleEffectKeys(),
                        value.statAffinityNames(),
                        value.defaultForHeroKeys(),
                        value.referenceKeys()
                ))
                .toList();
    }

    private static List<SkillImportSnapshot.HeroSkillDefaultSnapshot> cleanDefaults(
            List<SkillImportHeroDefaultDto> values
    ) {
        if (values == null || values.isEmpty()) return List.of();
        return values.stream()
                .filter(value -> value != null)
                .map(value -> new SkillImportSnapshot.HeroSkillDefaultSnapshot(
                        value.heroKey(),
                        value.defaultSkillKeys(),
                        value.referenceKeys(),
                        value.factionKey(),
                        value.classKey()
                ))
                .toList();
    }

    private static List<Map<String, Object>> copyMaps(List<Map<String, Object>> values) {
        if (values == null || values.isEmpty()) return List.of();
        return values.stream()
                .filter(value -> value != null)
                .map(Map::copyOf)
                .toList();
    }
}
