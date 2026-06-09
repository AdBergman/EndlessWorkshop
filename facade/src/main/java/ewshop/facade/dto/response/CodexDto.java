package ewshop.facade.dto.response;

import java.util.List;

public record CodexDto(
        String exportKind,
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
    public CodexDto(
            String exportKind,
            String entryKey,
            String displayName,
            String category,
            String kind,
            List<String> descriptionLines,
            List<String> referenceKeys
    ) {
        this(exportKind, entryKey, displayName, category, kind, descriptionLines, referenceKeys, List.of(), List.of(), List.of());
    }
}
