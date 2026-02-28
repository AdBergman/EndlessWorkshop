package ewshop.facade.dto.importing.codex;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CodexImportEntryDto(
        String entryKey,
        String displayName,
        List<String> descriptionLines,
        List<String> referenceLines
) {}