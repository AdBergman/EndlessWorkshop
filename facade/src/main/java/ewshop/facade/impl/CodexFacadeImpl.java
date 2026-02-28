package ewshop.facade.impl;

import ewshop.domain.service.CodexService;
import ewshop.facade.dto.response.CodexDto;
import ewshop.facade.interfaces.CodexFacade;
import ewshop.facade.mapper.CodexMapper;

import java.util.List;

public class CodexFacadeImpl implements CodexFacade {

    private final CodexService codexService;

    public CodexFacadeImpl(CodexService codexService) {
        this.codexService = codexService;
    }

    @Override
    public List<CodexDto> getAllCodexEntries() {
        return codexService.getAllCodexEntries().stream()
                .map(CodexMapper::toDto)
                .toList();
    }
}