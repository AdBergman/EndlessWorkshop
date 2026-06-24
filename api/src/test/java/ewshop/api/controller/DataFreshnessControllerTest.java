package ewshop.api.controller;

import ewshop.facade.dto.response.importing.DataFreshnessDto;
import ewshop.facade.dto.response.importing.AdminLatestImportDto;
import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.interfaces.ImportHistoryFacade;
import org.junit.jupiter.api.Test;
import org.springframework.http.converter.json.JacksonJsonHttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class DataFreshnessControllerTest {

    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    @Test
    void latestDataFreshnessReturnsPublicSafeSummary() throws Exception {
        DataFreshnessDto freshness = new DataFreshnessDto(
                true,
                "2026-06-23T10:00:00Z",
                "Endless Legend 2",
                "0.82",
                "1.2.3",
                "2026-06-22T05:57:36Z",
                "local-imports",
                2,
                List.of("codex", "tech"),
                null
        );
        MockMvc mockMvc = mockMvc(freshness);

        MvcResult result = mockMvc.perform(get("/api/data-freshness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true))
                .andExpect(jsonPath("$.latestImportAtUtc").value("2026-06-23T10:00:00Z"))
                .andExpect(jsonPath("$.gameVersion").value("0.82"))
                .andExpect(jsonPath("$.importedKinds[0]").value("codex"))
                .andReturn();

        String json = result.getResponse().getContentAsString();
        assertThat(json)
                .doesNotContain("fileSha")
                .doesNotContain("sourcePath")
                .doesNotContain("diagnostics")
                .doesNotContain("/Users/");
    }

    @Test
    void latestDataFreshnessReturnsGracefulEmptyResponse() throws Exception {
        MockMvc mockMvc = mockMvc(DataFreshnessDto.unavailable());

        mockMvc.perform(get("/api/data-freshness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false))
                .andExpect(jsonPath("$.importedFileCount").value(0));
    }

    private MockMvc mockMvc(DataFreshnessDto freshness) {
        return MockMvcBuilders.standaloneSetup(new DataFreshnessController(new StaticImportHistoryFacade(freshness)))
                .setMessageConverters(new JacksonJsonHttpMessageConverter(jsonMapper))
                .build();
    }

    private record StaticImportHistoryFacade(DataFreshnessDto freshness) implements ImportHistoryFacade {

        @Override
        public DataFreshnessDto getLatestDataFreshness() {
            return freshness;
        }

        @Override
        public AdminLatestImportDto getLatestImport() {
            return AdminLatestImportDto.unavailable();
        }

        @Override
        public void recordManualAdminImport(
                String filename,
                String exportKind,
                String importKind,
                String game,
                String gameVersion,
                String exporterVersion,
                String exportedAtUtc,
                String schemaVersion,
                Instant startedAtUtc,
                ImportSummaryDto summary
        ) {
        }

        @Override
        public void recordFailedManualAdminImport(
                String filename,
                String exportKind,
                String importKind,
                String game,
                String gameVersion,
                String exporterVersion,
                String exportedAtUtc,
                String schemaVersion,
                Instant startedAtUtc,
                String errorMessage
        ) {
        }
    }
}
