package ewshop.facade.dto.response;

import java.util.List;

public record CodexDto(
        String exportKind,
        String entryKey,
        String displayName,
        List<String> descriptionLines,
        List<String> referenceKeys
) {}