package ewshop.domain.model;

import java.util.List;

public record CodexMetadataSectionItem(
        String label,
        List<CodexMetadataFact> facts,
        List<String> lines
) {
    public CodexMetadataSectionItem {
        facts = facts == null ? List.of() : List.copyOf(facts);
        lines = lines == null ? List.of() : List.copyOf(lines);
    }
}
