package ewshop.app.config;

import ewshop.api.config.AdminTokenFilter;
import ewshop.api.controller.ImportAdminController;
import ewshop.api.controller.TechAdminController;
import ewshop.app.seo.SeoAdminController;
import ewshop.app.seo.SeoRegenerationKindResult;
import ewshop.app.seo.SeoRegenerationResult;
import ewshop.app.seo.SeoRegenerationService;
import ewshop.app.seo.audit.CodexMissingReferenceAuditSummary;
import ewshop.facade.interfaces.CodexImportAdminFacade;
import ewshop.facade.interfaces.DistrictImportAdminFacade;
import ewshop.facade.interfaces.ImprovementImportAdminFacade;
import ewshop.facade.interfaces.QuestExplorerImportAdminFacade;
import ewshop.facade.interfaces.TechAdminFacade;
import ewshop.facade.interfaces.TechImportAdminFacade;
import ewshop.facade.interfaces.UnitImportAdminFacade;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AdminTokenFilterAdminEndpointsTest {

    @Test
    void allAdminEndpointFamiliesRejectMissingToken() throws Exception {
        MockMvc mockMvc = adminMockMvc("secret-token");

        for (RequestBuilder request : adminEndpointRequests()) {
            mockMvc.perform(request)
                    .andExpect(status().isUnauthorized());
        }
    }

    @Test
    void allAdminEndpointFamiliesRejectWrongToken() throws Exception {
        MockMvc mockMvc = adminMockMvc("secret-token");

        for (RequestBuilder request : adminEndpointRequests("wrong-token")) {
            mockMvc.perform(request)
                    .andExpect(status().isForbidden());
        }
    }

    @Test
    void allAdminEndpointFamiliesFailClosedWhenConfiguredTokenIsBlank() throws Exception {
        MockMvc mockMvc = adminMockMvc("");

        for (RequestBuilder request : adminEndpointRequests("secret-token")) {
            mockMvc.perform(request)
                    .andExpect(status().isForbidden());
        }
    }

    @Test
    void allAdminEndpointFamiliesPermitValidToken() throws Exception {
        MockMvc mockMvc = adminMockMvc("secret-token");

        mockMvc.perform(get("/api/admin/import/check-token")
                        .header("X-Admin-Token", "secret-token"))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/api/admin/techs/placements")
                        .header("X-Admin-Token", "secret-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/api/admin/seo/regenerate")
                        .header("X-Admin-Token", "secret-token")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    private static RequestBuilder[] adminEndpointRequests() {
        return adminEndpointRequests(null);
    }

    private static RequestBuilder[] adminEndpointRequests(String token) {
        RequestBuilder importCheck = withOptionalToken(
                get("/api/admin/import/check-token"),
                token
        );
        RequestBuilder techPlacement = withOptionalToken(
                post("/api/admin/techs/placements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"),
                token
        );
        RequestBuilder seoRegenerate = withOptionalToken(
                post("/api/admin/seo/regenerate")
                        .accept(MediaType.APPLICATION_JSON),
                token
        );

        return new RequestBuilder[]{importCheck, techPlacement, seoRegenerate};
    }

    private static RequestBuilder withOptionalToken(
            org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder builder,
            String token
    ) {
        return token == null ? builder : builder.header("X-Admin-Token", token);
    }

    private static MockMvc adminMockMvc(String configuredToken) {
        SeoRegenerationService seoRegenerationService = mock(SeoRegenerationService.class);
        when(seoRegenerationService.regeneratePrototypePages()).thenReturn(okSeoResult());

        return MockMvcBuilders.standaloneSetup(
                        importAdminController(),
                        new TechAdminController(mock(TechAdminFacade.class)),
                        new SeoAdminController(seoRegenerationService)
                )
                .addFilter(new AdminTokenFilter(configuredToken))
                .build();
    }

    private static ImportAdminController importAdminController() {
        return new ImportAdminController(
                mock(TechImportAdminFacade.class),
                mock(DistrictImportAdminFacade.class),
                mock(ImprovementImportAdminFacade.class),
                mock(UnitImportAdminFacade.class),
                mock(CodexImportAdminFacade.class),
                mock(QuestExplorerImportAdminFacade.class)
        );
    }

    private static SeoRegenerationResult okSeoResult() {
        return new SeoRegenerationResult(
                0,
                List.of(),
                0,
                0,
                Map.of(),
                Map.of("tech", new SeoRegenerationKindResult(0, 0, 0)),
                new CodexMissingReferenceAuditSummary("codex-missing-references-audit.json", 0, 100.0, List.of()),
                List.of(),
                List.of(),
                true
        );
    }
}
