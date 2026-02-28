package ewshop.facade.interfaces;

import ewshop.facade.dto.response.CodexDto;

import java.util.List;

public interface CodexFacade {
    List<CodexDto> getAllCodexEntries();
}