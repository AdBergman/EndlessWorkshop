package ewshop.facade.dto.importing.codex;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
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
