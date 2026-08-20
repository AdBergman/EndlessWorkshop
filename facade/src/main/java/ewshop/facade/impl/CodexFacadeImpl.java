package ewshop.facade.impl;

import ewshop.domain.service.CodexService;
import ewshop.domain.service.CodexFilterService;
import ewshop.domain.service.CodexFilterResult;
import ewshop.facade.dto.response.CodexDto;
import ewshop.facade.dto.response.CodexSummaryDto;
import ewshop.facade.interfaces.CodexFacade;
import ewshop.facade.mapper.CodexMapper;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class CodexFacadeImpl implements CodexFacade {

    private static final String DUPLICATE_SLUG_REASON = "duplicate-slug";

    private final CodexService codexService;
    private final CodexFilterService codexFilterService;

    public CodexFacadeImpl(CodexService codexService, CodexFilterService codexFilterService) {
        this.codexService = codexService;
        this.codexFilterService = codexFilterService;
    }

    @Override
    public List<CodexDto> getAllCodexEntries() {
        return toDtos(codexFilterService.filterForCodexApi(codexService.getAllCodexEntries()));
    }

    @Override
    public List<CodexDto> getCodexEntriesByCategory(String category) {
        String normalizedCategory = trimToEmpty(category).toLowerCase(Locale.ROOT);
        if (normalizedCategory.isBlank()) {
            return List.of();
        }

        String sourceExportKind = isBonusDerivedKind(normalizedCategory)
                ? "bonuses"
                : normalizedCategory;
        CodexFilterResult filterResult = codexFilterService.filterForCodexApi(
                codexService.getCodexEntriesByExportKind(sourceExportKind)
        );

        return toDtos(filterResult).stream()
                .filter(dto -> normalizedCategory.equals(normalizeSummaryKind(
                        dto.exportKind(),
                        dto.category(),
                        dto.kind(),
                        dto.entryKey()
                )))
                .toList();
    }

    private static List<CodexDto> toDtos(CodexFilterResult filterResult) {
        Map<String, String> relationTargetAliases = relationTargetAliases(filterResult);

        return filterResult.codexEntries().stream()
                .map(CodexMapper::toDto)
                .map(dto -> withResolvedRelationAliases(dto, relationTargetAliases))
                .toList();
    }

    private static boolean isBonusDerivedKind(String normalizedCategory) {
        return "statuses".equals(normalizedCategory) || "modifiers".equals(normalizedCategory);
    }

    @Override
    public List<CodexSummaryDto> getCodexSummary() {
        CodexFilterResult filterResult = codexFilterService.filterForCodexApi(codexService.getAllCodexEntries());
        Map<String, Long> countsByKind = new LinkedHashMap<>();

        filterResult.codexEntries().forEach(entry -> {
            String exportKind = normalizeSummaryKind(
                    entry.getExportKind(),
                    entry.getCategory(),
                    entry.getKind(),
                    entry.getEntryKey()
            );
            if (!exportKind.isBlank()) {
                countsByKind.merge(exportKind, 1L, Long::sum);
            }
        });

        return countsByKind.entrySet().stream()
                .map(entry -> new CodexSummaryDto(entry.getKey(), entry.getValue()))
                .toList();
    }

    private static Map<String, String> relationTargetAliases(CodexFilterResult filterResult) {
        Map<String, String> aliases = new LinkedHashMap<>();
        filterResult.skippedEntries().stream()
                .filter(skip -> DUPLICATE_SLUG_REASON.equals(skip.reason()))
                .filter(skip -> !trimToEmpty(skip.entryKey()).isBlank())
                .filter(skip -> !trimToEmpty(skip.relationTargetEntryKey()).isBlank())
                .forEach(skip -> aliases.put(skip.entryKey(), skip.relationTargetEntryKey()));
        return aliases;
    }

    private static CodexDto withResolvedRelationAliases(CodexDto dto, Map<String, String> relationTargetAliases) {
        if (dto == null || relationTargetAliases.isEmpty()) {
            return dto;
        }

        List<String> referenceKeys = dto.referenceKeys() == null
                ? List.of()
                : dto.referenceKeys().stream()
                .map(key -> relationTargetAliases.getOrDefault(trimToEmpty(key), trimToEmpty(key)))
                .filter(key -> !key.isBlank())
                .distinct()
                .toList();

        if (referenceKeys.equals(dto.referenceKeys())) {
            return dto;
        }

        return new CodexDto(
                dto.exportKind(),
                dto.entryKey(),
                dto.displayName(),
                dto.category(),
                dto.kind(),
                dto.descriptionLines(),
                referenceKeys,
                dto.facts(),
                dto.sections(),
                dto.publicContextKeys(),
                dto.svgIcon()
        );
    }

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private static String normalizeSummaryKind(String exportKind, String category, String kind, String entryKey) {
        String normalizedExportKind = trimToEmpty(exportKind).toLowerCase(Locale.ROOT);
        if (!"bonuses".equals(normalizedExportKind)) {
            return normalizedExportKind;
        }

        if (isBonusStatusEntry(category, kind, entryKey)) {
            return "statuses";
        }

        if (isBonusModifierEntry(category, kind, entryKey)) {
            return "modifiers";
        }

        return normalizedExportKind;
    }

    private static boolean isBonusStatusEntry(String category, String kind, String entryKey) {
        String normalizedCategory = trimToEmpty(category).toLowerCase(Locale.ROOT);
        String normalizedKind = trimToEmpty(kind).toLowerCase(Locale.ROOT);
        String normalizedKey = trimToEmpty(entryKey);
        return "status".equals(normalizedCategory) ||
                "status".equals(normalizedKind) ||
                normalizedKey.startsWith("Status_") ||
                normalizedKey.startsWith("HeroStatus_") ||
                normalizedKey.startsWith("TreatyPublicOpinion_");
    }

    private static boolean isBonusModifierEntry(String category, String kind, String entryKey) {
        String normalizedCategory = trimToEmpty(category).toLowerCase(Locale.ROOT);
        String normalizedKind = trimToEmpty(kind).toLowerCase(Locale.ROOT);
        String normalizedKey = trimToEmpty(entryKey);
        return "cost modifier".equals(normalizedCategory) ||
                "cost modifier".equals(normalizedKind) ||
                normalizedKey.contains("CostModifier") ||
                normalizedKey.contains("CostModifer");
    }
}
