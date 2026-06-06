package ewshop.facade.dto.importing.codex;


import java.util.List;

public record CodexImportEntryDto(
        String entryKey,
        String displayName,
        String category,
        String kind,
        List<String> descriptionLines,
        List<String> referenceKeys
) {
    public CodexImportEntryDto(
            String entryKey,
            String displayName,
            List<String> descriptionLines,
            List<String> referenceKeys
    ) {
        this(entryKey, displayName, null, null, descriptionLines, referenceKeys);
    }
}
