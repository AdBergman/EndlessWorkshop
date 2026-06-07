package ewshop.app.seo.rendering;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

final class SeoDescriptionParser {

    private static final Pattern DETAIL_PATTERN = Pattern.compile("^([A-Za-z][A-Za-z /-]{1,40}):\\s*(.+)$");

    ParsedDescription parse(List<String> rawDescriptionLines) {
        List<String> normalizedLines = rawDescriptionLines.stream()
                .map(SeoDescriptionParser::normalizeContentLine)
                .filter(line -> !line.isBlank())
                .filter(line -> !isPrototypeLine(line))
                .toList();

        int introIndex = -1;
        for (int index = 0; index < normalizedLines.size(); index++) {
            if (isLikelyIntroLine(normalizedLines.get(index))) {
                introIndex = index;
                break;
            }
        }

        String introLine = introIndex >= 0 ? normalizedLines.get(introIndex) : "";
        List<String> contentLines = new ArrayList<>();
        for (int index = 0; index < normalizedLines.size(); index++) {
            if (index != introIndex) {
                contentLines.add(normalizedLines.get(index));
            }
        }

        return new ParsedDescription(
                introLine,
                List.copyOf(contentLines),
                List.copyOf(extractMetadataHighlights(normalizedLines))
        );
    }

    boolean isLikelyIntroLine(String line) {
        if (line.isBlank() || parseDetailLine(line) != null) {
            return false;
        }

        boolean hasSentencePunctuation = line.contains(".") || line.contains("!") || line.contains("?");
        long wordCount = Stream.of(line.split("\\s+"))
                .map(SeoDescriptionParser::normalizedToken)
                .filter(token -> !token.isBlank())
                .count();
        boolean looksStatLike = line.matches(".*\\d.*")
                || line.contains("+")
                || line.contains("%")
                || line.contains("->");

        return hasSentencePunctuation || (wordCount >= 6 && !looksStatLike);
    }

    private static DetailLine parseDetailLine(String line) {
        Matcher matcher = DETAIL_PATTERN.matcher(line);
        if (!matcher.matches()) {
            return null;
        }

        String label = trimToEmpty(matcher.group(1));
        String value = trimToEmpty(matcher.group(2));
        if (label.isBlank() || value.isBlank()) {
            return null;
        }

        return new DetailLine(label, value);
    }

    private static List<String> extractMetadataHighlights(List<String> lines) {
        LinkedHashMap<String, String> highlights = new LinkedHashMap<>();
        List<String> preferredKeys = List.of("Faction", "Category", "Type", "Role", "Slot", "Tier", "Rarity");

        for (String preferredKey : preferredKeys) {
            for (String line : lines) {
                DetailLine detailLine = parseDetailLine(line);
                if (detailLine != null && detailLine.label().equalsIgnoreCase(preferredKey)) {
                    highlights.putIfAbsent(preferredKey, detailLine.label() + ": " + detailLine.value());
                    break;
                }
            }
        }

        return highlights.values().stream().limit(3).toList();
    }

    private static String normalizeContentLine(String value) {
        String normalized = trimToEmpty(value)
                .replaceAll("\\[[^]]+]", " ")
                .replaceAll("([a-z])([A-Z])", "$1 $2")
                .replaceAll("\\s+", " ")
                .trim();
        if (normalized.isBlank()) {
            return normalized;
        }

        String deduped = normalized;
        String previous;
        do {
            previous = deduped;
            deduped = deduped.replaceAll("\\b([A-Za-z]+(?:\\s+[A-Za-z]+){0,2})\\s+\\1\\b", "$1");
        } while (!deduped.equals(previous));

        List<String> tokens = new ArrayList<>(List.of(deduped.split(" ")));
        if (tokens.size() >= 2
                && normalizedToken(tokens.getFirst()).equalsIgnoreCase(normalizedToken(tokens.get(1)))) {
            tokens.removeFirst();
        }
        return String.join(" ", tokens).trim();
    }

    private static boolean isPrototypeLine(String line) {
        return line.regionMatches(true, 0, "Prototype:", 0, "Prototype:".length());
    }

    private static String normalizedToken(String value) {
        return value.replaceAll("^[^A-Za-z0-9]+|[^A-Za-z0-9]+$", "");
    }

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    record DetailLine(String label, String value) {
    }
}
