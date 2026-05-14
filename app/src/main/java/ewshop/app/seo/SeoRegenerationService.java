package ewshop.app.seo;

import ewshop.app.seo.audit.CodexMissingReferenceAuditService;
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

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

@Service
public class SeoRegenerationService {

    private static final String DUPLICATE_SLUG_REASON = "duplicate-slug";

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

        CodexFilterResult filterResult = codexFilterService.filter(codexService.getAllCodexEntries());
        addDuplicateSlugWarnings(filterResult, warnings);

        List<PageCandidate> candidates = buildPageCandidates(filterResult);
        Map<String, ReferenceTarget> referenceTargetsByEntryKey = referenceTargetBuilder.buildReferenceTargets(candidates);
        CodexMissingReferenceAuditService.CodexMissingReferenceAudit missingReferenceAudit =
                missingReferenceAuditService.generate(candidates, referenceTargetsByEntryKey, filterResult);

        rebuildGeneratedPages(candidates, referenceTargetsByEntryKey);

        List<String> generatedRoutes = generatedSeoWriter.listGeneratedRoutes();
        generatedSeoWriter.writeUtf8(seoOutputLocator.getSitemapFile(), sitemapGenerator.generate(generatedRoutes));
        writeMissingReferenceAudit(missingReferenceAudit);

        return new SeoRegenerationResult(
                generatedRoutes.size(),
                List.copyOf(generatedRoutes),
                filterResult.filteredOutCount(),
                filterResult.skippedByReason().getOrDefault(DUPLICATE_SLUG_REASON, 0),
                Map.copyOf(filterResult.skippedByReason()),
                Map.copyOf(buildExportKindCounts(generatedRoutes, filterResult.skippedEntries())),
                missingReferenceAuditService.summarize(missingReferenceAudit),
                List.copyOf(warnings),
                List.of(),
                true
        );
    }

    private List<PageCandidate> buildPageCandidates(CodexFilterResult filterResult) {
        return filterResult.entries().stream()
                .sorted(Comparator
                        .comparing(CodexFilterResult.FilteredCodexEntry::normalizedExportKind, String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(CodexFilterResult.FilteredCodexEntry::normalizedDisplayName, String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(entry -> trimToEmpty(entry.entry().getEntryKey()), String.CASE_INSENSITIVE_ORDER))
                .map(this::toPageCandidate)
                .toList();
    }

    private PageCandidate toPageCandidate(CodexFilterResult.FilteredCodexEntry entry) {
        return new PageCandidate(
                entry.normalizedExportKind(),
                trimToEmpty(entry.entry().getEntryKey()),
                entry.normalizedDisplayName(),
                entry.meaningfulDescriptionLines(),
                entry.cleanedReferenceKeys(),
                entry.slug()
        );
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
                    seoOutputLocator.getFeaturedEntityFile(candidate.kind(), candidate.slug()),
                    seoPageRenderer.renderEntityHtml(
                            candidate,
                            SeoRoutes.routeFor(candidate.kind(), candidate.slug()),
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
            List<CodexFilterResult.CodexFilterSkip> skippedEntries
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

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private static final class MutableKindCounts {
        private int generatedCount;
        private int skippedCount;
        private int duplicateCount;
    }
}
