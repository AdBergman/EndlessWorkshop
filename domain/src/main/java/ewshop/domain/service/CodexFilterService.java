package ewshop.domain.service;

import ewshop.domain.model.Codex;
import ewshop.domain.service.CodexFilterResult.CodexFilterSkip;
import ewshop.domain.service.CodexFilterResult.FilteredCodexEntry;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Pattern;

@Service
public class CodexFilterService {

    private static final String INVALID_DISPLAY_NAME = "invalid-display-name";
    private static final String WEAK_DESCRIPTION_LINES = "weak-description-lines";
    private static final String DUPLICATE_SLUG = "duplicate-slug";
    private static final String FILTERED_OUT = "filtered-out";
    private static final Pattern LEADING_BRACKET_PREFIX_PATTERN = Pattern.compile("^\\[[^\\]]+]\\s*");
    private static final Pattern PLACEHOLDER_PATTERN = Pattern.compile(
            "(^%|\\b(?:tbd|todo|placeholder|lorem ipsum|coming soon)\\b|\\[tbd\\])",
            Pattern.CASE_INSENSITIVE
    );
    private static final Pattern DIGIT_CLUSTER_PATTERN = Pattern.compile("\\d{3,}");
    private static final Comparator<Codex> DETERMINISTIC_ORDER = Comparator
            .comparing((Codex entry) -> normalizeKey(entry.getExportKind()))
            .thenComparing(entry -> normalizeDisplayName(entry.getDisplayName()), String.CASE_INSENSITIVE_ORDER)
            .thenComparing(entry -> trimToEmpty(entry.getEntryKey()), String.CASE_INSENSITIVE_ORDER);

    public CodexFilterResult filter(List<Codex> rawEntries) {
        if (rawEntries == null || rawEntries.isEmpty()) {
            return new CodexFilterResult(List.of(), List.of(), 0, Map.of(FILTERED_OUT, 0));
        }

        List<FilteredCodexEntry> includedEntries = new ArrayList<>();
        List<CodexFilterSkip> skippedEntries = new ArrayList<>();
        Map<String, Integer> skippedByReason = new LinkedHashMap<>();
        Map<String, FilteredCodexEntry> seenByKindAndSlug = new LinkedHashMap<>();

        rawEntries.stream()
                .filter(Objects::nonNull)
                .sorted(DETERMINISTIC_ORDER)
                .forEach(entry -> {
                    String normalizedExportKind = normalizeKey(entry.getExportKind());
                    String rawDisplayName = trimToEmpty(entry.getDisplayName());
                    String normalizedDisplayName = normalizeDisplayName(rawDisplayName);
                    String normalizedEntryKey = trimToEmpty(entry.getEntryKey());

                    if (!isValidDisplayName(rawDisplayName, normalizedDisplayName)) {
                        recordSkip(skippedEntries, skippedByReason, entry, INVALID_DISPLAY_NAME);
                        return;
                    }

                    List<String> meaningfulDescriptionLines = cleanMeaningfulTextList(entry.getDescriptionLines());
                    if (meaningfulDescriptionLines.isEmpty()) {
                        recordSkip(skippedEntries, skippedByReason, entry, WEAK_DESCRIPTION_LINES);
                        return;
                    }

                    String slug = slugify(normalizedDisplayName);
                    if (slug.isBlank()) {
                        recordSkip(skippedEntries, skippedByReason, entry, INVALID_DISPLAY_NAME);
                        return;
                    }

                    String duplicateKey = normalizedExportKind + "::" + slug;
                    if (seenByKindAndSlug.containsKey(duplicateKey)) {
                        recordSkip(skippedEntries, skippedByReason, entry, DUPLICATE_SLUG);
                        return;
                    }

                    FilteredCodexEntry filteredEntry = new FilteredCodexEntry(
                            entry,
                            normalizedExportKind,
                            normalizedDisplayName,
                            meaningfulDescriptionLines,
                            cleanReferenceKeys(entry.getReferenceKeys()),
                            slug
                    );
                    seenByKindAndSlug.put(duplicateKey, filteredEntry);
                    includedEntries.add(filteredEntry);
                });

        skippedByReason.put(FILTERED_OUT, skippedEntries.size());

        return new CodexFilterResult(
                List.copyOf(includedEntries),
                List.copyOf(skippedEntries),
                skippedEntries.size(),
                Map.copyOf(skippedByReason)
        );
    }

    private static void recordSkip(
            List<CodexFilterSkip> skippedEntries,
            Map<String, Integer> skippedByReason,
            Codex entry,
            String reason
    ) {
        skippedEntries.add(new CodexFilterSkip(
                trimToEmpty(entry.getExportKind()),
                trimToEmpty(entry.getEntryKey()),
                trimToEmpty(entry.getDisplayName()),
                reason
        ));
        skippedByReason.merge(reason, 1, Integer::sum);
    }

    private static List<String> cleanMeaningfulTextList(List<String> values) {
        if (values == null || values.isEmpty()) {
            return List.of();
        }

        return values.stream()
                .map(CodexFilterService::trimToEmpty)
                .filter(CodexFilterService::isMeaningfulText)
                .distinct()
                .toList();
    }

    private static List<String> cleanReferenceKeys(List<String> referenceKeys) {
        if (referenceKeys == null || referenceKeys.isEmpty()) {
            return List.of();
        }

        return referenceKeys.stream()
                .map(CodexFilterService::trimToEmpty)
                .filter(value -> !value.isBlank())
                .distinct()
                .toList();
    }

    private static boolean isMeaningfulText(String value) {
        String normalized = trimToEmpty(value);
        return normalized.length() >= 3
                && !PLACEHOLDER_PATTERN.matcher(normalized).find()
                && hasBalancedFormatting(normalized);
    }

    private static boolean isValidDisplayName(String rawValue, String normalizedValue) {
        String raw = trimToEmpty(rawValue);
        String normalized = normalizeDisplayName(normalizedValue);
        return !normalized.isBlank()
                && isMeaningfulText(raw)
                && isMeaningfulText(normalized)
                && !containsUnsafeDisplayNamePattern(raw)
                && !containsUnsafeDisplayNamePattern(normalized);
    }

    private static boolean containsUnsafeDisplayNamePattern(String value) {
        String normalized = trimToEmpty(value);
        return normalized.contains("%")
                || DIGIT_CLUSTER_PATTERN.matcher(normalized).find();
    }

    private static boolean hasBalancedFormatting(String value) {
        List<Character> stack = new ArrayList<>();

        for (char character : value.toCharArray()) {
            if (character == '(' || character == '[' || character == '{') {
                stack.add(character);
                continue;
            }

            if (character == ')' || character == ']' || character == '}') {
                if (stack.isEmpty()) {
                    return false;
                }

                char open = stack.removeLast();
                if ((character == ')' && open != '(')
                        || (character == ']' && open != '[')
                        || (character == '}' && open != '{')) {
                    return false;
                }
            }
        }

        return stack.isEmpty();
    }

    private static String slugify(String value) {
        return Normalizer.normalize(value, Normalizer.Form.NFKD)
                .replace("'", "")
                .replace("\u2019", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
    }

    private static String normalizeKey(String value) {
        return trimToEmpty(value).toLowerCase(Locale.ROOT);
    }

    private static String normalizeDisplayName(String value) {
        String normalized = trimToEmpty(value);
        while (!normalized.isBlank()) {
            String stripped = LEADING_BRACKET_PREFIX_PATTERN.matcher(normalized).replaceFirst("");
            if (stripped.equals(normalized)) {
                break;
            }
            normalized = stripped.trim();
        }
        return normalized;
    }

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }
}
