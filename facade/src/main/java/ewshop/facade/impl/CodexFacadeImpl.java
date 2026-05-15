package ewshop.facade.impl;

import ewshop.domain.service.CodexService;
import ewshop.domain.service.CodexFilterService;
import ewshop.domain.service.CodexFilterResult;
import ewshop.facade.dto.response.CodexDto;
import ewshop.facade.interfaces.CodexFacade;
import ewshop.facade.mapper.CodexMapper;

import java.util.LinkedHashMap;
import java.util.List;
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
        CodexFilterResult filterResult = codexFilterService.filterForCodexApi(codexService.getAllCodexEntries());
        Map<String, String> relationTargetAliases = relationTargetAliases(filterResult);

        return filterResult.codexEntries().stream()
                .map(CodexMapper::toDto)
                .map(dto -> withResolvedRelationAliases(dto, relationTargetAliases))
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
                dto.descriptionLines(),
                referenceKeys
        );
    }

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }
}
