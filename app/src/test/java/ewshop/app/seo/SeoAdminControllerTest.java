package ewshop.app.seo;

import ewshop.api.config.AdminTokenFilter;
import ewshop.app.seo.audit.CodexMissingReferenceAuditSummary;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SeoAdminControllerTest {

    private MockMvc mockMvc;
    private SeoRegenerationService seoRegenerationService;

    @BeforeEach
    void setUp() {
        seoRegenerationService = mock(SeoRegenerationService.class);
        SeoAdminController controller = new SeoAdminController(seoRegenerationService);

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .addFilter(new AdminTokenFilter("secret-token"))
                .build();
    }

    @Test
    void regenerateSeo_requiresAdminToken() throws Exception {
        mockMvc.perform(post("/api/admin/seo/regenerate")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void regenerateSeo_rejectsInvalidAdminToken() throws Exception {
        mockMvc.perform(post("/api/admin/seo/regenerate")
                        .header("X-Admin-Token", "wrong-token")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    void regenerateSeo_returnsResultDto_whenAuthorized() throws Exception {
        SeoRegenerationResult result = new SeoRegenerationResult(
                1,
                List.of("/encyclopedia/tech/workshop"),
                0,
                0,
                Map.of(),
                Map.of("tech", new SeoRegenerationKindResult(1, 0, 0)),
                new CodexMissingReferenceAuditSummary(
                        "codex-missing-references-audit.json",
                        2,
                        75.0,
                        List.of("District: 2")
                ),
                List.of(),
                List.of(),
                true
        );
        when(seoRegenerationService.regeneratePrototypePages()).thenReturn(result);

        mockMvc.perform(post("/api/admin/seo/regenerate")
                        .header("X-Admin-Token", "secret-token")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.generatedCount").value(1))
                .andExpect(jsonPath("$.generatedRoutes[0]").value("/encyclopedia/tech/workshop"))
                .andExpect(jsonPath("$.skippedCount").value(0))
                .andExpect(jsonPath("$.duplicateCount").value(0))
                .andExpect(jsonPath("$.skippedByReason").isMap())
                .andExpect(jsonPath("$.exportKindCounts.tech.generatedCount").value(1))
                .andExpect(jsonPath("$.missingReferenceAudit.artifact").value("codex-missing-references-audit.json"))
                .andExpect(jsonPath("$.missingReferenceAudit.unresolvedReferences").value(2))
                .andExpect(jsonPath("$.missingReferenceAudit.topUnresolvedCategories[0]").value("District: 2"))
                .andExpect(jsonPath("$.sitemapUpdated").value(true));

        verify(seoRegenerationService).regeneratePrototypePages();
    }
}
