package ewshop.domain.model;

import java.util.List;

public record CodexMetadataSection(
        String title,
        List<String> lines,
        List<CodexMetadataSectionItem> items
) {
    public CodexMetadataSection {
        lines = lines == null ? List.of() : List.copyOf(lines);
        items = items == null ? List.of() : List.copyOf(items);
    }
}
