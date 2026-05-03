package ewshop.app.seo;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/seo")
public class SeoAdminController {

    private final SeoRegenerationService seoRegenerationService;

    public SeoAdminController(SeoRegenerationService seoRegenerationService) {
        this.seoRegenerationService = seoRegenerationService;
    }

    @PostMapping(value = "/regenerate", produces = "application/json")
    public SeoRegenerationResult regenerateSeoPages() {
        return seoRegenerationService.regeneratePrototypePages();
    }
}
