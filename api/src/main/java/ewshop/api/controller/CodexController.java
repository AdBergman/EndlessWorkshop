package ewshop.api.controller;

import ewshop.facade.dto.response.CodexDto;
import ewshop.facade.dto.response.CodexSummaryDto;
import ewshop.facade.interfaces.CodexFacade;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/codex")
public class CodexController {

    private final CodexFacade codexFacade;

    public CodexController(CodexFacade codexFacade) {
        this.codexFacade = codexFacade;
    }

    @GetMapping
    public List<CodexDto> getAll(@RequestParam(required = false) String category) {
        if (category == null || category.isBlank()) {
            return codexFacade.getAllCodexEntries();
        }

        return codexFacade.getCodexEntriesByCategory(category);
    }

    @GetMapping("/summary")
    public List<CodexSummaryDto> getSummary() {
        return codexFacade.getCodexSummary();
    }
}
