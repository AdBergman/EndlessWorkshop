package ewshop.facade.dto.importing.codex;

import java.util.List;

public record CodexImportEntryDto(
        String entryKey,
        String displayName,
        List<String> descriptionLines,
        List<CodexImportReferenceLineDto> referenceLines
) {}