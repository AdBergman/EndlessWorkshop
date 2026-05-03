package ewshop.facade.impl;

import ewshop.domain.service.CodexService;
import ewshop.domain.service.CodexFilterService;
import ewshop.facade.dto.response.CodexDto;
import ewshop.facade.interfaces.CodexFacade;
import ewshop.facade.mapper.CodexMapper;

import java.util.List;

public class CodexFacadeImpl implements CodexFacade {

    private final CodexService codexService;
    private final CodexFilterService codexFilterService;

    public CodexFacadeImpl(CodexService codexService, CodexFilterService codexFilterService) {
        this.codexService = codexService;
        this.codexFilterService = codexFilterService;
    }

    @Override
    public List<CodexDto> getAllCodexEntries() {
        return codexFilterService.filter(codexService.getAllCodexEntries()).codexEntries().stream()
                .map(CodexMapper::toDto)
                .toList();
    }
}
