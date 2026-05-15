package ewshop.app.seo;

import ewshop.app.seo.audit.CodexMissingReferenceAuditService;
import ewshop.app.seo.generation.CodexVariantAlias;
import ewshop.app.seo.generation.PageCandidate;
import ewshop.app.seo.generation.ReferenceTarget;
import ewshop.app.seo.generation.ReferenceTargetBuilder;
import ewshop.app.seo.generation.SeoRoutes;
import ewshop.app.seo.generation.SitemapGenerator;
import ewshop.app.seo.rendering.SeoPageRenderer;
import ewshop.app.seo.storage.GeneratedSeoWriter;
import ewshop.app.seo.storage.SeoOutputLocator;
import ewshop.domain.service.CodexFilterResult;
import ewshop.domain.service.CodexFilterService;
import ewshop.domain.service.CodexService;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@Service
public class SeoRegenerationService {

    private static final String DUPLICATE_SLUG_REASON = "duplicate-slug";
    private static final String CANONICALIZED_DUPLICATE_REASON = "canonicalized-duplicate";

    private final CodexService codexService;
    private final CodexFilterService codexFilterService;
    private final SeoOutputLocator seoOutputLocator;
    private final CodexMissingReferenceAuditService missingReferenceAuditService;
    private final ReferenceTargetBuilder referenceTargetBuilder;
    private final SeoPageRenderer seoPageRenderer;
    private final SitemapGenerator sitemapGenerator;
    private final GeneratedSeoWriter generatedSeoWriter;

    public SeoRegenerationService(
            CodexService codexService,
            CodexFilterService codexFilterService,
            SeoOutputLocator seoOutputLocator,
            CodexMissingReferenceAuditService missingReferenceAuditService,
            ReferenceTargetBuilder referenceTargetBuilder,
            SeoPageRenderer seoPageRenderer,
            SitemapGenerator sitemapGenerator,
            GeneratedSeoWriter generatedSeoWriter
    ) {
        this.codexService = codexService;
        this.codexFilterService = codexFilterService;
        this.seoOutputLocator = seoOutputLocator;
        this.missingReferenceAuditService = missingReferenceAuditService;
        this.referenceTargetBuilder = referenceTargetBuilder;
        this.seoPageRenderer = seoPageRenderer;
        this.sitemapGenerator = sitemapGenerator;
        this.generatedSeoWriter = generatedSeoWriter;
    }

    public SeoRegenerationResult regeneratePrototypePages() {
        List<String> warnings = new ArrayList<>();

        CodexFilterResult filterResult = codexFilterService.filterForCodexApi(codexService.getAllCodexEntries());
        addDuplicateSlugWarnings(filterResult, warnings);

        List<PageCandidate> candidates = buildPageCandidates(filterResult);
        List<PageCandidate> indexableCandidates = candidates.stream()
                .filter(PageCandidate::indexable)
                .toList();
        Map<String, ReferenceTarget> referenceTargetsByEntryKey = referenceTargetBuilder.buildReferenceTargets(candidates);
        CodexMissingReferenceAuditService.CodexMissingReferenceAudit missingReferenceAudit =
                missingReferenceAuditService.generate(indexableCandidates, referenceTargetsByEntryKey, filterResult);

        rebuildGeneratedPages(candidates, referenceTargetsByEntryKey);

        List<String> generatedRoutes = generatedSeoWriter.listGeneratedRoutes();
        List<String> indexableRoutes = candidates.stream()
                .filter(PageCandidate::indexable)
                .map(PageCandidate::route)
                .sorted()
                .toList();
        List<String> publicGeneratedRoutes = generatedRoutes.stream()
                .filter(route -> route.equals("/" + SeoRoutes.ENCYCLOPEDIA_PAGE) || route.split("/").length == 3)
                .toList();
        List<String> sitemapRoutes = new ArrayList<>(publicGeneratedRoutes);
        sitemapRoutes.addAll(indexableRoutes);
        generatedSeoWriter.writeUtf8(seoOutputLocator.getSitemapFile(), sitemapGenerator.generate(sitemapRoutes));
        writeMissingReferenceAudit(missingReferenceAudit);

        return new SeoRegenerationResult(
                generatedRoutes.size(),
                List.copyOf(generatedRoutes),
                filterResult.filteredOutCount() + canonicalizedDuplicateCount(candidates),
                canonicalizedDuplicateCount(candidates),
                skippedByReasonWithCanonicalizedDuplicates(filterResult, candidates),
                Map.copyOf(buildExportKindCounts(generatedRoutes, filterResult.skippedEntries(), candidates)),
                missingReferenceAuditService.summarize(missingReferenceAudit),
                List.copyOf(warnings),
                List.of(),
                true
        );
    }

    private List<PageCandidate> buildPageCandidates(CodexFilterResult filterResult) {
        List<CodexFilterResult.FilteredCodexEntry> sortedEntries = filterResult.entries().stream()
                .sorted(Comparator
                        .comparing(CodexFilterResult.FilteredCodexEntry::normalizedExportKind, String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(CodexFilterResult.FilteredCodexEntry::normalizedDisplayName, String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(entry -> trimToEmpty(entry.entry().getEntryKey()), String.CASE_INSENSITIVE_ORDER))
                .toList();

        Map<String, List<CodexFilterResult.FilteredCodexEntry>> byKindSlug = new LinkedHashMap<>();
        for (CodexFilterResult.FilteredCodexEntry entry : sortedEntries) {
            byKindSlug
                    .computeIfAbsent(entry.normalizedExportKind() + "::" + entry.slug(), ignored -> new ArrayList<>())
                    .add(entry);
        }

        List<PageCandidate> candidates = new ArrayList<>();
        for (List<CodexFilterResult.FilteredCodexEntry> group : byKindSlug.values()) {
            candidates.addAll(toVariantAwareCandidates(group));
        }
        return List.copyOf(candidates);
    }

    private List<PageCandidate> toVariantAwareCandidates(List<CodexFilterResult.FilteredCodexEntry> group) {
        Map<String, PageCandidate> canonicalBySignature = new LinkedHashMap<>();
        List<PageCandidate> candidates = new ArrayList<>();

        for (int index = 0; index < group.size(); index++) {
            CodexFilterResult.FilteredCodexEntry entry = group.get(index);
            String entryKey = trimToEmpty(entry.entry().getEntryKey());
            String signature = variantSignature(entry);

            PageCandidate canonicalForSignature = canonicalBySignature.get(signature);
            boolean isRepresentative = index == 0;
            boolean isIndexable = isRepresentative || canonicalForSignature == null;
            String entryKeySlug = isRepresentative ? "" : slugify(entryKey);
            String route = isRepresentative
                    ? SeoRoutes.routeFor(entry.normalizedExportKind(), entry.slug())
                    : SeoRoutes.routeFor(entry.normalizedExportKind(), entry.slug(), entryKeySlug);
            String canonicalRoute = isIndexable
                    ? route
                    : canonicalForSignature.canonicalRoute();
            String contextLabel = variantContextLabel(entry);

            PageCandidate candidate = new PageCandidate(
                    entry.normalizedExportKind(),
                    entryKey,
                    entry.normalizedDisplayName(),
                    trimToEmpty(entry.entry().getCategory()),
                    trimToEmpty(entry.entry().getKind()),
                    entry.meaningfulDescriptionLines(),
                    entry.cleanedReferenceKeys(),
                    entry.slug(),
                    entryKeySlug,
                    route,
                    canonicalRoute,
                    isIndexable,
                    contextLabel,
                    List.of()
            );

            if (isIndexable) {
                canonicalBySignature.put(signature, candidate);
            }
            candidates.add(candidate);
        }

        return attachCanonicalizedVariants(candidates);
    }

    private static List<PageCandidate> attachCanonicalizedVariants(List<PageCandidate> candidates) {
        Map<String, List<CodexVariantAlias>> aliasesByCanonicalRoute = new LinkedHashMap<>();
        for (PageCandidate candidate : candidates) {
            if (candidate.indexable() || Objects.equals(candidate.route(), candidate.canonicalRoute())) {
                continue;
            }
            aliasesByCanonicalRoute
                    .computeIfAbsent(candidate.canonicalRoute(), ignored -> new ArrayList<>())
                    .add(new CodexVariantAlias(
                            candidate.entryKey(),
                            candidate.displayName(),
                            candidate.contextLabel(),
                            candidate.route()
                    ));
        }

        return candidates.stream()
                .map(candidate -> new PageCandidate(
                        candidate.kind(),
                        candidate.entryKey(),
                        candidate.displayName(),
                        candidate.category(),
                        candidate.sourceKind(),
                        candidate.descriptionLines(),
                        candidate.referenceKeys(),
                        candidate.slug(),
                        candidate.entryKeySlug(),
                        candidate.route(),
                        candidate.canonicalRoute(),
                        candidate.indexable(),
                        candidate.contextLabel(),
                        List.copyOf(aliasesByCanonicalRoute.getOrDefault(candidate.route(), List.of()))
                ))
                .toList();
    }

    private void rebuildGeneratedPages(
            List<PageCandidate> candidates,
            Map<String, ReferenceTarget> referenceTargetsByEntryKey
    ) {
        LinkedHashSet<String> kindsToRebuild = new LinkedHashSet<>(generatedSeoWriter.listExistingGeneratedKinds());
        candidates.stream()
                .map(PageCandidate::kind)
                .forEach(kindsToRebuild::add);
        kindsToRebuild.add(SeoRoutes.ENCYCLOPEDIA_PAGE);
        generatedSeoWriter.deleteGeneratedOutput(kindsToRebuild);

        for (PageCandidate candidate : candidates) {
            generatedSeoWriter.writeUtf8(
                    seoOutputLocator.getFeaturedEntityFile(candidate.kind(), candidate.slug(), candidate.entryKeySlug()),
                    seoPageRenderer.renderEntityHtml(
                            candidate,
                            candidate.route(),
                            referenceTargetsByEntryKey
                    )
            );
        }
        generatedSeoWriter.writeUtf8(
                seoOutputLocator.getGeneratedIndexFile(SeoRoutes.ENCYCLOPEDIA_PAGE),
                seoPageRenderer.renderEncyclopediaRootHtml(candidates)
        );
        for (Map.Entry<String, List<PageCandidate>> entry : seoPageRenderer.candidatesByKind(candidates).entrySet()) {
            generatedSeoWriter.writeUtf8(
                    seoOutputLocator.getEncyclopediaCategoryFile(entry.getKey()),
                    seoPageRenderer.renderEncyclopediaKindHtml(entry.getKey(), entry.getValue())
            );
        }
    }

    private void writeMissingReferenceAudit(CodexMissingReferenceAuditService.CodexMissingReferenceAudit audit) {
        generatedSeoWriter.writeUtf8(
                seoOutputLocator.getMissingReferenceAuditJsonFile(),
                missingReferenceAuditService.renderJson(audit)
        );
        generatedSeoWriter.writeUtf8(
                seoOutputLocator.getMissingReferenceAuditMarkdownFile(),
                missingReferenceAuditService.renderMarkdown(audit)
        );
    }

    private Map<String, SeoRegenerationKindResult> buildExportKindCounts(
            List<String> generatedRoutes,
            List<CodexFilterResult.CodexFilterSkip> skippedEntries,
            List<PageCandidate> candidates
    ) {
        Map<String, MutableKindCounts> countsByKind = new LinkedHashMap<>();

        for (String route : generatedRoutes) {
            String[] routeParts = route.split("/");
            if (routeParts.length < 4 || !SeoRoutes.ENCYCLOPEDIA_PAGE.equals(routeParts[1])) {
                continue;
            }
            String kind = routeParts[2];
            countsByKind.computeIfAbsent(kind, ignored -> new MutableKindCounts()).generatedCount++;
        }

        for (CodexFilterResult.CodexFilterSkip skip : skippedEntries) {
            String kind = trimToEmpty(skip.exportKind());
            countsByKind.computeIfAbsent(kind, ignored -> new MutableKindCounts()).skippedCount++;
            if (DUPLICATE_SLUG_REASON.equals(skip.reason())) {
                countsByKind.get(kind).duplicateCount++;
            }
        }

        for (PageCandidate candidate : candidates) {
            if (candidate.indexable()) {
                continue;
            }
            MutableKindCounts counts = countsByKind.computeIfAbsent(candidate.kind(), ignored -> new MutableKindCounts());
            counts.skippedCount++;
            counts.duplicateCount++;
        }

        Map<String, SeoRegenerationKindResult> exportKindCounts = new LinkedHashMap<>();
        countsByKind.forEach((kind, counts) -> exportKindCounts.put(
                kind,
                new SeoRegenerationKindResult(counts.generatedCount, counts.skippedCount, counts.duplicateCount)
        ));
        return exportKindCounts;
    }

    private void addDuplicateSlugWarnings(CodexFilterResult filterResult, List<String> warnings) {
        filterResult.skippedEntries().stream()
                .filter(skip -> DUPLICATE_SLUG_REASON.equals(skip.reason()))
                .map(skip -> "Skipped codex entry '" + skip.entryKey() + "' in kind '" + skip.exportKind()
                        + "' because its normalized display-name slug duplicates an earlier entry.")
                .forEach(warnings::add);
    }

    private static Map<String, Integer> skippedByReasonWithCanonicalizedDuplicates(
            CodexFilterResult filterResult,
            List<PageCandidate> candidates
    ) {
        Map<String, Integer> skippedByReason = new LinkedHashMap<>(filterResult.skippedByReason());
        int duplicateCount = canonicalizedDuplicateCount(candidates);
        if (duplicateCount > 0) {
            skippedByReason.merge(CANONICALIZED_DUPLICATE_REASON, duplicateCount, Integer::sum);
            skippedByReason.merge("filtered-out", duplicateCount, Integer::sum);
        }
        return Map.copyOf(skippedByReason);
    }

    private static int canonicalizedDuplicateCount(List<PageCandidate> candidates) {
        return (int) candidates.stream()
                .filter(candidate -> !candidate.indexable())
                .count();
    }

    private static String variantSignature(CodexFilterResult.FilteredCodexEntry entry) {
        return String.join("\n",
                normalizedText(String.join(" ", entry.meaningfulDescriptionLines())),
                normalizedText(String.join(" ", entry.cleanedReferenceKeys())),
                normalizedText(entry.entry().getCategory()),
                normalizedText(entry.entry().getKind()),
                normalizedText(inferredFaction(entry))
        );
    }

    private static String variantContextLabel(CodexFilterResult.FilteredCodexEntry entry) {
        List<String> parts = new ArrayList<>();
        addIfPresent(parts, inferredFaction(entry));
        addIfPresent(parts, inferredQuestStep(entry));
        addIfPresent(parts, entry.entry().getCategory());
        addIfPresent(parts, entry.entry().getKind());
        if (isOnlyGenericKindContext(parts, entry)) {
            parts.clear();
        }
        if (parts.isEmpty()) {
            addIfPresent(parts, humanizeEntryKeyContext(entry.entry().getEntryKey()));
        }
        return String.join(" ", parts);
    }

    private static boolean isOnlyGenericKindContext(List<String> parts, CodexFilterResult.FilteredCodexEntry entry) {
        if (parts.size() != 1) {
            return false;
        }
        String sourceKind = trimToEmpty(entry.entry().getKind());
        if (sourceKind.isBlank() || !parts.getFirst().equalsIgnoreCase(sourceKind)) {
            return false;
        }
        return sourceKind.equalsIgnoreCase(singularKindLabel(entry.normalizedExportKind()));
    }

    private static String singularKindLabel(String kind) {
        return switch (trimToEmpty(kind).toLowerCase(Locale.ROOT)) {
            case "abilities" -> "Ability";
            case "councilors" -> "Councilor";
            case "districts" -> "District";
            case "equipment" -> "Equipment";
            case "factions" -> "Faction";
            case "heroes" -> "Hero";
            case "improvements" -> "Improvement";
            case "minorfactions" -> "Minor Faction";
            case "populations" -> "Population";
            case "quests" -> "Quest";
            case "tech" -> "Technology";
            case "traits" -> "Trait";
            case "units" -> "Unit";
            default -> humanizeToken(kind);
        };
    }

    private static String inferredQuestStep(CodexFilterResult.FilteredCodexEntry entry) {
        if (!SeoRoutes.QUESTS_KIND.equals(entry.normalizedExportKind())) {
            return "";
        }

        String entryKey = trimToEmpty(entry.entry().getEntryKey());
        List<String> parts = new ArrayList<>();
        String chapter = firstRegexGroup(entryKey, "Chapter([0-9]+[A-Za-z]?)");
        String step = firstRegexGroup(entryKey, "Step([0-9]+)");
        String choice = firstRegexGroup(entryKey, "Choice([0-9]+)");
        if (!chapter.isBlank()) {
            parts.add("Chapter " + chapter);
        }
        if (!step.isBlank()) {
            parts.add("Step " + step);
        }
        if (!choice.isBlank()) {
            parts.add("Choice " + choice);
        }
        return String.join(" ", parts);
    }

    private static String firstRegexGroup(String value, String pattern) {
        java.util.regex.Matcher matcher = java.util.regex.Pattern
                .compile(pattern, java.util.regex.Pattern.CASE_INSENSITIVE)
                .matcher(value);
        return matcher.find() ? matcher.group(1) : "";
    }

    private static void addIfPresent(List<String> values, String value) {
        String normalized = trimToEmpty(value);
        if (!normalized.isBlank() && values.stream().noneMatch(existing -> existing.equalsIgnoreCase(normalized))) {
            values.add(normalized);
        }
    }

    private static String inferredFaction(CodexFilterResult.FilteredCodexEntry entry) {
        List<String> candidates = new ArrayList<>();
        candidates.add(entry.entry().getEntryKey());
        candidates.addAll(entry.cleanedReferenceKeys());
        candidates.addAll(entry.meaningfulDescriptionLines());

        for (String value : candidates) {
            String faction = inferFactionToken(value);
            if (!faction.isBlank()) {
                return faction;
            }
        }
        return "";
    }

    private static String inferFactionToken(String value) {
        String normalized = trimToEmpty(value);
        if (normalized.isBlank()) {
            return "";
        }

        int factionIndex = normalized.indexOf("Faction_");
        if (factionIndex >= 0) {
            return humanizeToken(readIdentifierToken(normalized.substring(factionIndex + "Faction_".length())));
        }

        String factionQuest = firstRegexGroup(normalized, "FactionQuest_([A-Za-z0-9]+)_");
        if (!factionQuest.isBlank()) {
            return humanizeToken(factionQuest);
        }

        int minorFactionIndex = normalized.indexOf("MinorFaction_");
        if (minorFactionIndex >= 0) {
            return humanizeToken(readIdentifierToken(normalized.substring(minorFactionIndex + "MinorFaction_".length())));
        }

        if (normalized.contains("LastLord") || normalized.contains("Last Lord")) {
            return "Last Lords";
        }
        return "";
    }

    private static String readIdentifierToken(String value) {
        int end = 0;
        while (end < value.length()) {
            char character = value.charAt(end);
            if (!(Character.isLetterOrDigit(character) || character == '_')) {
                break;
            }
            end++;
        }
        return value.substring(0, end);
    }

    private static String humanizeToken(String value) {
        String spaced = trimToEmpty(value)
                .replace('_', ' ')
                .replaceAll("([a-z])([A-Z])", "$1 $2")
                .replaceAll("\\s+", " ")
                .trim();
        if (spaced.isBlank()) {
            return "";
        }
        String[] parts = spaced.split(" ");
        List<String> formatted = new ArrayList<>();
        for (String part : parts) {
            if (part.isBlank()) {
                continue;
            }
            formatted.add(part.substring(0, 1).toUpperCase(Locale.ROOT) + part.substring(1));
        }
        return String.join(" ", formatted);
    }

    private static String humanizeEntryKeyContext(String value) {
        List<String> tokens = new ArrayList<>(List.of(humanizeToken(value).split(" ")));
        while (tokens.size() > 1 && isTechnicalKeyToken(tokens.getFirst())) {
            tokens.removeFirst();
        }
        while (tokens.size() > 1 && "Definition".equalsIgnoreCase(tokens.getLast())) {
            tokens.removeLast();
        }
        return String.join(" ", tokens).trim();
    }

    private static boolean isTechnicalKeyToken(String token) {
        return switch (trimToEmpty(token).toLowerCase(Locale.ROOT)) {
            case "ability", "aspect", "councilor", "councilors", "district", "equipment", "faction", "hero",
                    "improvement", "population", "tech", "technology", "unit", "unitability" -> true;
            default -> false;
        };
    }

    private static String slugify(String value) {
        return Normalizer.normalize(trimToEmpty(value), Normalizer.Form.NFKD)
                .replace("'", "")
                .replace("\u2019", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
    }

    private static String normalizedText(String value) {
        return trimToEmpty(value)
                .toLowerCase(Locale.ROOT)
                .replaceAll("\\s+", " ");
    }

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private static final class MutableKindCounts {
        private int generatedCount;
        private int skippedCount;
        private int duplicateCount;
    }
}
