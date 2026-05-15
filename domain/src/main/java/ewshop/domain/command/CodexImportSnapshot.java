package ewshop.domain.command;

import java.util.List;

public final class CodexImportSnapshot {

    private final String entryKey;
    private final String displayName;
    private final String exportKind;
    private final String category;
    private final String kind;
    private final List<String> descriptionLines;
    private final List<String> referenceKeys;

    public CodexImportSnapshot(
            String entryKey,
            String displayName,
            String exportKind,
            String category,
            String kind,
            List<String> descriptionLines,
            List<String> referenceKeys
    ) {
        this.entryKey = entryKey;
        this.displayName = displayName;
        this.exportKind = exportKind;
        this.category = category;
        this.kind = kind;
        this.descriptionLines = descriptionLines;
        this.referenceKeys = referenceKeys;
    }

    public String entryKey() { return entryKey; }
    public String displayName() { return displayName; }
    public String exportKind() { return exportKind; }
    public String category() { return category; }
    public String kind() { return kind; }
    public List<String> descriptionLines() { return descriptionLines; }
    public List<String> referenceKeys() { return referenceKeys; }
}
