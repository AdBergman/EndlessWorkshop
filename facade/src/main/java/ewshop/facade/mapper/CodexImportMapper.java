package ewshop.facade.mapper;

import ewshop.domain.command.CodexImportSnapshot;
import ewshop.facade.dto.importing.codex.CodexImportEntryDto;

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

        return new CodexImportSnapshot(key, name, publicExportKind, category, sourceKind, descriptionLines, referenceKeys);
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
}
