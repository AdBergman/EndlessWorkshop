package ewshop.facade.dto.importing.quests;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record QuestExplorerImportEntryDto(
        String entryKey,
        String title,
        List<String> summaryLines,
        String questType,
        Boolean isMandatory,
        Boolean isKeyNarrativeBeat,
        List<String> aliases,
        QuestExplorerImportNavigationDto navigation,
        QuestExplorerImportLoreViewDto loreView,
        QuestExplorerImportStrategyViewDto strategyView,
        List<QuestExplorerImportBranchDto> branches,
        QuestExplorerImportQualityDto quality
) {}
