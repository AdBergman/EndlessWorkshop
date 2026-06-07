package ewshop.app.seo;

import ewshop.app.seo.audit.CodexMissingReferenceAuditService;
import ewshop.app.seo.generation.PageCandidate;
import ewshop.app.seo.generation.PageCandidateBuilder;
import ewshop.app.seo.generation.ReferenceTarget;
import ewshop.app.seo.generation.ReferenceTargetBuilder;
import ewshop.app.seo.generation.SeoRoutes;
import ewshop.app.seo.generation.SitemapGenerator;
import ewshop.app.seo.generation.SitemapRoutePolicy;
import ewshop.app.seo.rendering.SeoPageRenderer;
import ewshop.app.seo.storage.GeneratedSeoWriter;
import ewshop.app.seo.storage.SeoOutputLocator;
import ewshop.domain.service.CodexFilterResult;
import ewshop.domain.service.CodexFilterService;
import ewshop.domain.service.CodexService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

@Service
public class SeoRegenerationService {

    private static final String DUPLICATE_SLUG_REASON = "duplicate-slug";
    private static final String CANONICALIZED_DUPLICATE_REASON = "canonicalized-duplicate";

    private final CodexService codexService;
    private final CodexFilterService codexFilterService;
    private final SeoOutputLocator seoOutputLocator;
    private final CodexMissingReferenceAuditService missingReferenceAuditService;
    private final PageCandidateBuilder pageCandidateBuilder;
    private final ReferenceTargetBuilder referenceTargetBuilder;
    private final SeoPageRenderer seoPageRenderer;
    private final SitemapGenerator sitemapGenerator;
    private final SitemapRoutePolicy sitemapRoutePolicy;
    private final GeneratedSeoWriter generatedSeoWriter;

    public SeoRegenerationService(
            CodexService codexService,
            CodexFilterService codexFilterService,
            SeoOutputLocator seoOutputLocator,
            CodexMissingReferenceAuditService missingReferenceAuditService,
            PageCandidateBuilder pageCandidateBuilder,
            ReferenceTargetBuilder referenceTargetBuilder,
            SeoPageRenderer seoPageRenderer,
            SitemapGenerator sitemapGenerator,
            SitemapRoutePolicy sitemapRoutePolicy,
            GeneratedSeoWriter generatedSeoWriter
    ) {
        this.codexService = codexService;
        this.codexFilterService = codexFilterService;
        this.seoOutputLocator = seoOutputLocator;
        this.missingReferenceAuditService = missingReferenceAuditService;
        this.pageCandidateBuilder = pageCandidateBuilder;
        this.referenceTargetBuilder = referenceTargetBuilder;
        this.seoPageRenderer = seoPageRenderer;
        this.sitemapGenerator = sitemapGenerator;
        this.sitemapRoutePolicy = sitemapRoutePolicy;
        this.generatedSeoWriter = generatedSeoWriter;
    }

    public SeoRegenerationResult regeneratePrototypePages() {
        List<String> warnings = new ArrayList<>();

        CodexFilterResult filterResult = codexFilterService.filterForCodexApi(codexService.getAllCodexEntries());
        addDuplicateSlugWarnings(filterResult, warnings);

        List<PageCandidate> candidates = pageCandidateBuilder.buildPageCandidates(filterResult);
        List<PageCandidate> indexableCandidates = candidates.stream()
                .filter(PageCandidate::indexable)
                .toList();
        Map<String, ReferenceTarget> referenceTargetsByEntryKey = referenceTargetBuilder.buildReferenceTargets(candidates);
        CodexMissingReferenceAuditService.CodexMissingReferenceAudit missingReferenceAudit =
                missingReferenceAuditService.generate(indexableCandidates, referenceTargetsByEntryKey, filterResult);

        rebuildGeneratedPages(candidates, referenceTargetsByEntryKey);

        List<String> generatedRoutes = generatedSeoWriter.listGeneratedRoutes();
        List<String> sitemapRoutes = sitemapRoutePolicy.routesFor(generatedRoutes, candidates);
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

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private static final class MutableKindCounts {
        private int generatedCount;
        private int skippedCount;
        private int duplicateCount;
    }
}
