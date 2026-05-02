package ewshop.domain.command;

import java.util.List;

public final class CodexImportSnapshot {

    private final String entryKey;
    private final String displayName;
    private final String exportKind;
    private final List<String> descriptionLines;
    private final List<String> referenceKeys;

    public CodexImportSnapshot(
            String entryKey,
            String displayName,
            String exportKind,
            List<String> descriptionLines,
            List<String> referenceKeys
    ) {
        this.entryKey = entryKey;
        this.displayName = displayName;
        this.exportKind = exportKind;
        this.descriptionLines = descriptionLines;
        this.referenceKeys = referenceKeys;
    }

    public String entryKey() { return entryKey; }
    public String displayName() { return displayName; }
    public String exportKind() { return exportKind; }
    public List<String> descriptionLines() { return descriptionLines; }
    public List<String> referenceKeys() { return referenceKeys; }
}
