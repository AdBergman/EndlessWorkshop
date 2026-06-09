package ewshop.facade.dto.importing.codex;

import java.util.List;

public record CodexMetadataSectionDto(
        String title,
        List<String> lines,
        List<CodexMetadataSectionItemDto> items
) {}
