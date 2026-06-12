package ewshop.facade.dto.response;

import java.util.List;

public record CodexMetadataSectionItemDto(
        String label,
        String referenceKey,
        List<CodexMetadataFactDto> facts,
        List<String> lines
) {}
