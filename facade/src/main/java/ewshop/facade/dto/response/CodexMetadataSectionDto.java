package ewshop.facade.dto.response;

import java.util.List;

public record CodexMetadataSectionDto(
        String title,
        List<String> lines,
        List<CodexMetadataSectionItemDto> items
) {}
