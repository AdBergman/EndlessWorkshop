package ewshop.facade.interfaces;

import ewshop.facade.dto.response.CodexDto;
import ewshop.facade.dto.response.CodexSummaryDto;

import java.util.List;

public interface CodexFacade {
    List<CodexDto> getAllCodexEntries();

    List<CodexSummaryDto> getCodexSummary();
}
