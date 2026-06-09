package ewshop.facade.dto.importing.codex;

import java.util.List;

public record CodexMetadataSectionItemDto(
        String label,
        List<CodexMetadataFactDto> facts,
        List<String> lines
) {}
