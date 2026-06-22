package ewshop.domain.command;

import ewshop.domain.model.CodexMetadataFact;
import ewshop.domain.model.CodexMetadataSection;
import ewshop.domain.model.CodexSvgIcon;

import java.util.List;

public final class CodexImportSnapshot {

    private final String entryKey;
    private final String displayName;
    private final String exportKind;
    private final String category;
    private final String kind;
    private final List<String> descriptionLines;
    private final List<String> referenceKeys;
    private final List<CodexMetadataFact> facts;
    private final List<CodexMetadataSection> sections;
    private final List<String> publicContextKeys;
    private final CodexSvgIcon svgIcon;

    public CodexImportSnapshot(
            String entryKey,
            String displayName,
            String exportKind,
            String category,
            String kind,
            List<String> descriptionLines,
            List<String> referenceKeys
    ) {
        this(entryKey, displayName, exportKind, category, kind, descriptionLines, referenceKeys, List.of(), List.of(), List.of(), null);
    }

    public CodexImportSnapshot(
            String entryKey,
            String displayName,
            String exportKind,
            String category,
            String kind,
            List<String> descriptionLines,
            List<String> referenceKeys,
            List<CodexMetadataFact> facts,
            List<CodexMetadataSection> sections,
            List<String> publicContextKeys
    ) {
        this(entryKey, displayName, exportKind, category, kind, descriptionLines, referenceKeys, facts, sections, publicContextKeys, null);
    }

    public CodexImportSnapshot(
            String entryKey,
            String displayName,
            String exportKind,
            String category,
            String kind,
            List<String> descriptionLines,
            List<String> referenceKeys,
            List<CodexMetadataFact> facts,
            List<CodexMetadataSection> sections,
            List<String> publicContextKeys,
            CodexSvgIcon svgIcon
    ) {
        this.entryKey = entryKey;
        this.displayName = displayName;
        this.exportKind = exportKind;
        this.category = category;
        this.kind = kind;
        this.descriptionLines = descriptionLines;
        this.referenceKeys = referenceKeys;
        this.facts = facts == null ? List.of() : List.copyOf(facts);
        this.sections = sections == null ? List.of() : List.copyOf(sections);
        this.publicContextKeys = publicContextKeys == null ? List.of() : List.copyOf(publicContextKeys);
        this.svgIcon = svgIcon;
    }

    public String entryKey() { return entryKey; }
    public String displayName() { return displayName; }
    public String exportKind() { return exportKind; }
    public String category() { return category; }
    public String kind() { return kind; }
    public List<String> descriptionLines() { return descriptionLines; }
    public List<String> referenceKeys() { return referenceKeys; }
    public List<CodexMetadataFact> facts() { return facts; }
    public List<CodexMetadataSection> sections() { return sections; }
    public List<String> publicContextKeys() { return publicContextKeys; }
    public CodexSvgIcon svgIcon() { return svgIcon; }
}
