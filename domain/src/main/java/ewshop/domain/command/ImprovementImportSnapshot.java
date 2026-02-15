package ewshop.domain.command;

import java.util.List;

public record ImprovementImportSnapshot(
        String constructibleKey,
        String displayName,
        String category,
        List<String> descriptionLines
) {}