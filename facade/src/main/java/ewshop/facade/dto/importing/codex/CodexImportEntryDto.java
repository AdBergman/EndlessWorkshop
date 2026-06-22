package ewshop.facade.dto.importing.codex;

import java.util.List;

public record CodexImportEntryDto(
        String entryKey,
        String displayName,
        String category,
        String kind,
        List<String> descriptionLines,
        List<String> referenceKeys,
        List<CodexMetadataFactDto> facts,
        List<CodexMetadataSectionDto> sections,
        List<String> publicContextKeys,
        CodexSvgIconDto svgIcon
) {
    public CodexImportEntryDto(
            String entryKey,
            String displayName,
            String category,
            String kind,
            List<String> descriptionLines,
            List<String> referenceKeys,
            List<CodexMetadataFactDto> facts,
            List<CodexMetadataSectionDto> sections,
            List<String> publicContextKeys
    ) {
        this(entryKey, displayName, category, kind, descriptionLines, referenceKeys, facts, sections, publicContextKeys, null);
    }

    public CodexImportEntryDto(
            String entryKey,
            String displayName,
            String category,
            String kind,
            List<String> descriptionLines,
            List<String> referenceKeys
    ) {
        this(entryKey, displayName, category, kind, descriptionLines, referenceKeys, List.of(), List.of(), List.of(), null);
    }

    public CodexImportEntryDto(
            String entryKey,
            String displayName,
            List<String> descriptionLines,
            List<String> referenceKeys
    ) {
        this(entryKey, displayName, null, null, descriptionLines, referenceKeys, List.of(), List.of(), List.of(), null);
    }
}
