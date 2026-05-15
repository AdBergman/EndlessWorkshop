package ewshop.facade.dto.response;

import java.util.List;

public record CodexDto(
        String exportKind,
        String entryKey,
        String displayName,
        String category,
        String kind,
        List<String> descriptionLines,
        List<String> referenceKeys
) {}
