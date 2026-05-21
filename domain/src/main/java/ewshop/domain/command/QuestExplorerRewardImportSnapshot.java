package ewshop.domain.command;

import java.math.BigDecimal;

public record QuestExplorerRewardImportSnapshot(
        String rewardKey,
        String kind,
        String displayText,
        BigDecimal amount,
        String groupLabel,
        Integer groupOrder,
        String formulaText,
        String assetKind,
        String assetKey,
        String assetDisplayName,
        String referenceKind,
        String referenceKey,
        String referenceDisplayName,
        String codexEntryKey,
        String targetScopeLabel
) {}
