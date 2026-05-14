package ewshop.domain.service;

import ewshop.domain.model.Codex;

import java.util.List;
import java.util.Map;

public record CodexFilterResult(
        List<FilteredCodexEntry> entries,
        List<CodexFilterSkip> skippedEntries,
        int filteredOutCount,
        Map<String, Integer> skippedByReason
) {

    public List<Codex> codexEntries() {
        return entries.stream()
                .map(FilteredCodexEntry::entry)
                .toList();
    }

    public record FilteredCodexEntry(
            Codex entry,
            String normalizedExportKind,
            String normalizedDisplayName,
            List<String> meaningfulDescriptionLines,
            List<String> cleanedReferenceKeys,
            String slug
    ) {
    }

    public record CodexFilterSkip(
            String exportKind,
            String entryKey,
            String displayName,
            String reason,
            String relationTargetEntryKey
    ) {
    }
}
