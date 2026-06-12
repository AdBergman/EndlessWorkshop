package ewshop.facade.mapper;

import ewshop.domain.command.CodexImportSnapshot;
import ewshop.domain.model.CodexMetadataFact;
import ewshop.domain.model.CodexMetadataSection;
import ewshop.domain.model.CodexMetadataSectionItem;
import ewshop.facade.dto.importing.codex.CodexImportEntryDto;
import ewshop.facade.dto.importing.codex.CodexMetadataFactDto;
import ewshop.facade.dto.importing.codex.CodexMetadataSectionDto;
import ewshop.facade.dto.importing.codex.CodexMetadataSectionItemDto;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public final class CodexImportMapper {

    private static final String DISTRICTS_EXPORT_KIND = "districts";
    private static final String EXTRACTORS_EXPORT_KIND = "extractors";
    private static final String EXTRACTOR_ENTRY_KEY_PREFIX = "Extractor_";
    private static final String EXTRACTORS_CATEGORY = "Extractors";
    private static final String UNIT_CLASS_PREFIX = "UnitClass_";
    private static final String CLASS_LINE_PREFIX = "Class:";

    private CodexImportMapper() {}

    public static CodexImportSnapshot toSnapshot(String exportKind, CodexImportEntryDto dto) {
        if (dto == null) throw new IllegalArgumentException("Codex entry row is null");

        String kind = trimToNull(exportKind);
        if (kind == null) throw new IllegalArgumentException("exportKind is missing");

        String key = trimToNull(dto.entryKey());
        if (key == null) throw new IllegalArgumentException("entryKey is missing");

        String name = CodexDisplayNameNormalizer.normalize(key, dto.displayName());
        if (name == null) throw new IllegalArgumentException("displayName is missing for " + key);

        boolean extractor = isExtractorDistrict(kind, key);
        String publicExportKind = extractor ? EXTRACTORS_EXPORT_KIND : kind;
        String category = extractor ? EXTRACTORS_CATEGORY : trimToNull(dto.category());
        String sourceKind = trimToNull(dto.kind());
        List<String> descriptionLines = cleanDescriptionLines(dto.descriptionLines());
        List<String> referenceKeys = cleanDistinctLines(dto.referenceKeys());
        List<CodexMetadataFact> facts = cleanFacts(dto.facts());
        List<CodexMetadataSection> sections = cleanSections(dto.sections());
        List<String> publicContextKeys = cleanDistinctLines(dto.publicContextKeys());

        return new CodexImportSnapshot(
                key,
                name,
                publicExportKind,
                category,
                sourceKind,
                descriptionLines,
                referenceKeys,
                facts,
                sections,
                publicContextKeys
        );
    }

    private static boolean isExtractorDistrict(String exportKind, String entryKey) {
        return DISTRICTS_EXPORT_KIND.equalsIgnoreCase(trimToNull(exportKind))
                && trimToEmpty(entryKey).startsWith(EXTRACTOR_ENTRY_KEY_PREFIX);
    }

    private static String trimToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static String trimToEmpty(String s) {
        return s == null ? "" : s.trim();
    }

    private static List<String> cleanDescriptionLines(List<String> in) {
        if (in == null || in.isEmpty()) return List.of();

        List<String> out = new ArrayList<>(in.size());
        for (String line : in) {
            if (line == null) continue;
            String t = line.trim();
            if (t.isBlank()) continue;
            out.add(normalizeDescriptionLine(t));
        }
        return out;
    }

    private static String normalizeDescriptionLine(String line) {
        if (!line.startsWith(CLASS_LINE_PREFIX)) return line;

        String rawClassKey = line.substring(CLASS_LINE_PREFIX.length()).trim();
        if (!rawClassKey.startsWith(UNIT_CLASS_PREFIX)) return line;

        String displayClassName = UnitClassDisplayNameNormalizer.normalize(rawClassKey);
        if (displayClassName == null) return line;
        return CLASS_LINE_PREFIX + " " + displayClassName;
    }

    // Clean + dedupe while preserving order (prevents uq_codex_reference_keys_key collisions)
    private static List<String> cleanDistinctLines(List<String> in) {
        if (in == null || in.isEmpty()) return List.of();

        List<String> out = new ArrayList<>(in.size());
        Set<String> seen = new HashSet<>();
        for (String line : in) {
            if (line == null) continue;
            String t = line.trim();
            if (t.isBlank()) continue;
            if (seen.add(t)) out.add(t);
        }
        return out;
    }

    private static List<CodexMetadataFact> cleanFacts(List<CodexMetadataFactDto> in) {
        if (in == null || in.isEmpty()) return List.of();

        List<CodexMetadataFact> out = new ArrayList<>(in.size());
        for (CodexMetadataFactDto fact : in) {
            if (fact == null) continue;
            String label = trimToNull(fact.label());
            String value = trimToNull(fact.value());
            if (label == null || value == null) continue;
            out.add(new CodexMetadataFact(label, value, trimToNull(fact.referenceKey())));
        }
        return out;
    }

    private static List<CodexMetadataSection> cleanSections(List<CodexMetadataSectionDto> in) {
        if (in == null || in.isEmpty()) return List.of();

        List<CodexMetadataSection> out = new ArrayList<>(in.size());
        for (CodexMetadataSectionDto section : in) {
            if (section == null) continue;
            String title = trimToNull(section.title());
            if (title == null) continue;

            List<String> lines = cleanDescriptionLines(section.lines());
            List<CodexMetadataSectionItem> items = cleanSectionItems(section.items());
            if (lines.isEmpty() && items.isEmpty()) continue;

            out.add(new CodexMetadataSection(title, lines, items));
        }
        return out;
    }

    private static List<CodexMetadataSectionItem> cleanSectionItems(List<CodexMetadataSectionItemDto> in) {
        if (in == null || in.isEmpty()) return List.of();

        List<CodexMetadataSectionItem> out = new ArrayList<>(in.size());
        for (CodexMetadataSectionItemDto item : in) {
            if (item == null) continue;
            String label = trimToNull(item.label());
            if (label == null) continue;

            String referenceKey = trimToNull(item.referenceKey());
            List<CodexMetadataFact> facts = cleanFacts(item.facts());
            List<String> lines = cleanDescriptionLines(item.lines());
            if (referenceKey == null && facts.isEmpty() && lines.isEmpty()) continue;

            out.add(new CodexMetadataSectionItem(label, referenceKey, facts, lines));
        }
        return out;
    }
}
