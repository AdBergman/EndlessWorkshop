package ewshop.api.controller;

import ewshop.facade.dto.importing.ImportCountsDto;
import ewshop.facade.dto.importing.ImportDiagnosticsDto;
import ewshop.facade.dto.importing.ImportPreviewSummaryDto;
import ewshop.facade.dto.importing.ImportSummaryDto;
import ewshop.facade.dto.importing.codex.CodexImportBatchDto;
import ewshop.facade.dto.importing.districts.DistrictImportBatchDto;
import ewshop.facade.dto.importing.improvements.ImprovementImportBatchDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportBatchDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportEntryDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportLoreViewDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportNavigationDto;
import ewshop.facade.dto.importing.quests.QuestExplorerImportStrategyViewDto;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;
import ewshop.facade.dto.importing.tech.TechImportTechDto;
import ewshop.facade.dto.importing.units.UnitImportBatchDto;
import ewshop.facade.dto.importing.units.UnitImportUnitDto;
import ewshop.facade.interfaces.CodexImportAdminFacade;
import ewshop.facade.interfaces.DistrictImportAdminFacade;
import ewshop.facade.interfaces.ImprovementImportAdminFacade;
import ewshop.facade.interfaces.QuestExplorerImportAdminFacade;
import ewshop.facade.interfaces.TechImportAdminFacade;
import ewshop.facade.interfaces.UnitImportAdminFacade;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.JacksonJsonHttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ImportAdminControllerTest {

    private final JsonMapper jsonMapper = JsonMapper.builder()
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            .build();
    private final ObjectMapper objectMapper = jsonMapper;
    private RecordingTechImportAdminFacade techFacade;
    private RecordingDistrictImportAdminFacade districtFacade;
    private RecordingImprovementImportAdminFacade improvementFacade;
    private RecordingUnitImportAdminFacade unitFacade;
    private RecordingQuestExplorerImportAdminFacade questFacade;
    private RecordingCodexImportAdminFacade codexFacade;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        techFacade = new RecordingTechImportAdminFacade();
        districtFacade = new RecordingDistrictImportAdminFacade();
        improvementFacade = new RecordingImprovementImportAdminFacade();
        unitFacade = new RecordingUnitImportAdminFacade();
        questFacade = new RecordingQuestExplorerImportAdminFacade();
        codexFacade = new RecordingCodexImportAdminFacade();
        ImportAdminController controller = new ImportAdminController(
                techFacade,
                districtFacade,
                improvementFacade,
                unitFacade,
                codexFacade,
                questFacade
        );
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setMessageConverters(new JacksonJsonHttpMessageConverter(jsonMapper))
                .setControllerAdvice(new ApiExceptionHandler())
                .build();
    }

    @Test
    void smokeTestTechs_returnsOk_andCallsFacade_whenPayloadHasTechs() throws Exception {
        TechImportBatchDto payload = new TechImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "now",
                "tech",
                List.of(new TechImportTechDto(
                        "Tech_A",
                        "A",
                        null,
                        false,
                        1,
                        "Discovery",
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of()
                ))
        );

        mockMvc.perform(post("/api/admin/import/techs/smoke")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.kind").value("tech"))
                .andExpect(jsonPath("$.received").value(1));

        assertEquals(payload, techFacade.lastSmokeDto);
        assertNull(techFacade.lastImportDto);
    }

    @Test
    void importTechs_ignoresUnknownExporterFields() throws Exception {
        String payload = """
                {
                  "game": "Endless Legend 2",
                  "gameVersion": "0.80",
                  "exporterVersion": "0.1.0",
                  "exportedAtUtc": "now",
                  "exportKind": "tech",
                  "ignoredExporterBatchField": true,
                  "techs": [
                    {
                      "techKey": "Tech_A",
                      "displayName": "A",
                      "hidden": false,
                      "eraIndex": 1,
                      "quadrant": "Discovery",
                      "ignoredExporterTechField": "future",
                      "technologyPrerequisiteTechKeys": [],
                      "exclusiveTechnologyPrerequisiteTechKeys": [],
                      "factionTraitPrerequisites": [
                        { "operator": "Any", "traitKey": "Trait_A", "ignoredTraitField": "future" }
                      ],
                      "unlocks": [
                        {
                          "unlockType": "Constructible",
                          "unlockCategory": "District",
                          "unlockElementName": "District_A",
                          "descriptorKeys": [],
                          "descriptorLines": [],
                          "descriptorLineKeys": [],
                          "ignoredUnlockField": "future"
                        }
                      ]
                    }
                  ]
                }
                """;

        mockMvc.perform(post("/api/admin/import/techs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());

        assertNotNull(techFacade.lastImportDto);
        assertEquals("Tech_A", techFacade.lastImportDto.techs().getFirst().techKey());
        assertEquals("Trait_A", techFacade.lastImportDto.techs().getFirst().factionTraitPrerequisites().getFirst().traitKey());
        assertEquals("District_A", techFacade.lastImportDto.techs().getFirst().unlocks().getFirst().unlockElementName());
    }

    @Test
    void importDistricts_ignoresUnknownExporterFields() throws Exception {
        String payload = """
                {
                  "game": "Endless Legend 2",
                  "gameVersion": "0.80",
                  "exporterVersion": "0.1.0",
                  "exportedAtUtc": "now",
                  "exportKind": "districts",
                  "ignoredExporterBatchField": true,
                  "districts": [
                    {
                      "districtKey": "District_A",
                      "displayName": "District A",
                      "category": "Science",
                      "descriptionLines": ["+2 Science"],
                      "ignoredExporterDistrictField": "future"
                    }
                  ]
                }
                """;

        mockMvc.perform(post("/api/admin/import/districts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());

        assertNotNull(districtFacade.lastDto);
        assertEquals("District_A", districtFacade.lastDto.districts().getFirst().districtKey());
        assertEquals("+2 Science", districtFacade.lastDto.districts().getFirst().descriptionLines().getFirst());
    }

    @Test
    void importImprovements_ignoresUnknownExporterFields() throws Exception {
        String payload = """
                {
                  "game": "Endless Legend 2",
                  "gameVersion": "0.80",
                  "exporterVersion": "0.1.0",
                  "exportedAtUtc": "now",
                  "exportKind": "improvements",
                  "ignoredExporterBatchField": true,
                  "improvements": [
                    {
                      "constructibleKey": "Improvement_A",
                      "displayName": "Improvement A",
                      "category": "Economy",
                      "descriptionLines": ["+15 Approval"],
                      "ignoredExporterImprovementField": "future"
                    }
                  ]
                }
                """;

        mockMvc.perform(post("/api/admin/import/improvements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());

        assertNotNull(improvementFacade.lastDto);
        assertEquals("Improvement_A", improvementFacade.lastDto.improvements().getFirst().constructibleKey());
        assertEquals("+15 Approval", improvementFacade.lastDto.improvements().getFirst().descriptionLines().getFirst());
    }

    @Test
    void smokeTestUnits_returnsOk_andCallsFacade_whenPayloadHasUnits() throws Exception {
        UnitImportBatchDto payload = new UnitImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "now",
                "units",
                List.of(new UnitImportUnitDto(
                        "Unit_A",
                        "A",
                        "Kin",
                        true,
                        false,
                        false,
                        "Land",
                        null,
                        List.of(),
                        0,
                        "UnitClass_Ranged",
                        null,
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of()
                ))
        );

        mockMvc.perform(post("/api/admin/import/units/smoke")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.kind").value("units"))
                .andExpect(jsonPath("$.received").value(1));

        assertEquals(payload, unitFacade.lastSmokeDto);
        assertNull(unitFacade.lastImportDto);
    }

    @Test
    void importUnits_ignoresUnknownExporterFields() throws Exception {
        String payload = """
                {
                  "game": "Endless Legend 2",
                  "gameVersion": "0.80",
                  "exporterVersion": "0.1.0",
                  "exportedAtUtc": "now",
                  "exportKind": "units",
                  "ignoredExporterBatchField": true,
                  "units": [
                    {
                      "unitKey": "Unit_A",
                      "displayName": "Unit A",
                      "faction": "Kin",
                      "isMajorFaction": true,
                      "isHero": false,
                      "isChosen": false,
                      "spawnType": "Land",
                      "previousUnitKey": null,
                      "nextEvolutionUnitKeys": [],
                      "evolutionTierIndex": 1,
                      "unitClassKey": "UnitClass_Ranged",
                      "attackSkillKey": "Skill_Attack_1",
                      "ownAbilityKeys": [],
                      "abilityKeys": ["UnitAbility_A"],
                      "descriptionLines": ["Line 1"],
                      "ownDescriptorKeys": [],
                      "descriptorKeys": [],
                      "ignoredExporterUnitField": "future"
                    }
                  ]
                }
                """;

        mockMvc.perform(post("/api/admin/import/units")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());

        assertNotNull(unitFacade.lastImportDto);
        assertEquals("Unit_A", unitFacade.lastImportDto.units().getFirst().unitKey());
        assertEquals("UnitAbility_A", unitFacade.lastImportDto.units().getFirst().abilityKeys().getFirst());
    }

    @Test
    void importQuestExplorer_returnsOk_andCallsFacade_whenPayloadHasEntries() throws Exception {
        QuestExplorerImportBatchDto payload = questPayload(List.of(questEntry()));

        mockMvc.perform(post("/api/admin/import/quests/explorer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk());

        assertEquals(payload, questFacade.lastDto);
    }

    @Test
    void importQuestExplorer_ignoresUnknownExporterFields() throws Exception {
        String payload = """
                {
                  "gameVersion": "0.80",
                  "exporterVersion": "0.1.0",
                  "exportedAtUtc": "now",
                  "exportKind": "quest_explorer",
                  "schemaVersion": "quest_explorer.v3",
                  "ignoredExporterBatchField": true,
                  "entries": [
                    {
                      "entryKey": "Quest_A",
                      "title": "A Quest",
                      "summaryLines": ["Summary"],
                      "category": "Curiosity",
                      "isKnownToPlayer": true,
                      "isHidden": false,
                      "aliases": ["Source_A"],
                      "ignoredExporterEntryField": "future",
                      "navigation": {
                        "chapterNumber": 1,
                        "previousEntryKeys": [],
                        "nextEntryKeys": [],
                        "failureEntryKeys": [],
                        "convergesIntoEntryKeys": [],
                        "ignoredNavigationField": "future"
                      },
                      "loreView": { "sections": [], "ignoredLoreViewField": "future" },
                      "strategyView": { "objectives": [], "ignoredStrategyViewField": "future" },
                      "branches": [],
                      "quality": { "warnings": [], "ignoredQualityField": "future" }
                    }
                  ]
                }
                """;

        mockMvc.perform(post("/api/admin/import/quests/explorer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());

        assertNotNull(questFacade.lastDto);
        assertEquals("Quest_A", questFacade.lastDto.entries().getFirst().entryKey());
        assertEquals("Source_A", questFacade.lastDto.entries().getFirst().aliases().getFirst());
    }

    @Test
    void importQuestExplorer_returnsBadRequest_andDoesNotCallFacade_whenEntriesAreEmpty() throws Exception {
        questFacade.rejection = new IllegalArgumentException("Quest explorer file entries[] must not be empty");
        QuestExplorerImportBatchDto payload = questPayload(List.of());

        mockMvc.perform(post("/api/admin/import/quests/explorer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
                .andExpect(jsonPath("$.message").value("Quest explorer file entries[] must not be empty"))
                .andExpect(jsonPath("$.path").value("/api/admin/import/quests/explorer"));

        assertNull(questFacade.lastDto);
    }

    @Test
    void importUnits_returnsBadRequestJson_whenFacadeRejectsImport() throws Exception {
        unitFacade.rejectImport = true;
        UnitImportBatchDto payload = new UnitImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "now",
                "units",
                List.of(new UnitImportUnitDto(
                        "Unit_A",
                        "A",
                        "Kin",
                        true,
                        false,
                        false,
                        "Land",
                        null,
                        List.of(),
                        0,
                        "UnitClass_Ranged",
                        null,
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of()
                ))
        );

        mockMvc.perform(post("/api/admin/import/units")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("IMPORT_REJECTED"))
                .andExpect(jsonPath("$.message").value("Unit import produced 0 public units; refusing to write/delete."))
                .andExpect(jsonPath("$.path").value("/api/admin/import/units"));
    }

    @Test
    void importUnits_returnsBadRequestJson_whenFacadeRejectsDuplicateUnitKey() throws Exception {
        unitFacade.rejection = new IllegalArgumentException("Duplicate unitKey in import file: Unit_A");

        UnitImportBatchDto payload = new UnitImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "now",
                "units",
                List.of(new UnitImportUnitDto(
                        "Unit_A",
                        "A",
                        "Kin",
                        true,
                        false,
                        false,
                        "Land",
                        null,
                        List.of(),
                        0,
                        "UnitClass_Ranged",
                        null,
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of()
                ))
        );

        mockMvc.perform(post("/api/admin/import/units")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
                .andExpect(jsonPath("$.message").value("Duplicate unitKey in import file: Unit_A"))
                .andExpect(jsonPath("$.path").value("/api/admin/import/units"));
    }


    @Test
    void importTechs_returnsBadRequestJson_whenFacadeRejectsWrongExportKind() throws Exception {
        techFacade.rejection = new IllegalArgumentException(
                "Wrong import file type: expected exportKind='tech' but got 'units'"
        );

        mockMvc.perform(post("/api/admin/import/techs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(techPayload("units", List.of(tech("Technology_A"))))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
                .andExpect(jsonPath("$.message").value("Wrong import file type: expected exportKind='tech' but got 'units'"))
                .andExpect(jsonPath("$.path").value("/api/admin/import/techs"));
    }

    @Test
    void importDistricts_returnsBadRequestJson_whenFacadeRejectsDuplicateKey() throws Exception {
        districtFacade.rejection = new IllegalArgumentException("Duplicate districtKey in import file: District_A");

        DistrictImportBatchDto payload = new DistrictImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "now",
                "districts",
                List.of(
                        new ewshop.facade.dto.importing.districts.DistrictImportDistrictDto(
                                "District_A",
                                "District A",
                                "Science",
                                List.of("Line")
                        )
                )
        );

        mockMvc.perform(post("/api/admin/import/districts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
                .andExpect(jsonPath("$.message").value("Duplicate districtKey in import file: District_A"))
                .andExpect(jsonPath("$.path").value("/api/admin/import/districts"));
    }

    @Test
    void importImprovements_returnsBadRequestJson_whenFacadeRejectsDuplicateKey() throws Exception {
        improvementFacade.rejection = new IllegalArgumentException(
                "Duplicate constructibleKey in import file: Improvement_A"
        );

        ImprovementImportBatchDto payload = new ImprovementImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "now",
                "improvements",
                List.of(
                        new ewshop.facade.dto.importing.improvements.ImprovementImportImprovementDto(
                                "Improvement_A",
                                "Improvement A",
                                "Economy",
                                List.of("Line")
                        )
                )
        );

        mockMvc.perform(post("/api/admin/import/improvements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
                .andExpect(jsonPath("$.message").value("Duplicate constructibleKey in import file: Improvement_A"))
                .andExpect(jsonPath("$.path").value("/api/admin/import/improvements"));
    }

    @Test
    void importCodex_returnsBadRequestJson_whenFacadeRejectsMissingExportKind() throws Exception {
        codexFacade.rejection = new IllegalArgumentException("exportKind is missing");

        CodexImportBatchDto payload = new CodexImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "now",
                "",
                List.of(new ewshop.facade.dto.importing.codex.CodexImportEntryDto(
                        "Entry_A",
                        "Entry A",
                        List.of("Line"),
                        List.of()
                ))
        );

        mockMvc.perform(post("/api/admin/import/codex")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
                .andExpect(jsonPath("$.message").value("exportKind is missing"))
                .andExpect(jsonPath("$.path").value("/api/admin/import/codex"));
    }

    @Test
    void importQuestExplorer_returnsBadRequestJson_whenFacadeRejectsDuplicateEntryKey() throws Exception {
        questFacade.rejection = new IllegalArgumentException("Duplicate entryKey in import file: Quest_A");

        mockMvc.perform(post("/api/admin/import/quests/explorer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(questPayload(List.of(questEntry())))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
                .andExpect(jsonPath("$.message").value("Duplicate entryKey in import file: Quest_A"))
                .andExpect(jsonPath("$.path").value("/api/admin/import/quests/explorer"));
    }

    @Test
    void importTemporaryChronicleEndpoint_isNotMapped() throws Exception {
        mockMvc.perform(post("/api/admin/import/quests/chronicle")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void importCodexStillUsesGenericEntriesContract() throws Exception {
        codexFacade.rejection = new IllegalArgumentException("Import file has no entries");
        CodexImportBatchDto payload = new CodexImportBatchDto(
                "Endless Legend 2", "0.80", "0.1.0", "now", "quests", List.of()
        );

        mockMvc.perform(post("/api/admin/import/codex")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
                .andExpect(jsonPath("$.message").value("Import file has no entries"))
                .andExpect(jsonPath("$.path").value("/api/admin/import/codex"));

        assertNull(codexFacade.lastDto);
    }

    @Test
    void importCodex_ignoresUnknownExporterFields() throws Exception {
        String payload = """
                {
                  "game": "Endless Legend 2",
                  "gameVersion": "0.80",
                  "exporterVersion": "0.1.0",
                  "exportedAtUtc": "now",
                  "exportKind": "codex",
                  "ignoredExporterBatchField": true,
                  "entries": [
                    {
                      "entryKey": "Codex_A",
                      "displayName": "Codex A",
                      "category": "Lore",
                      "kind": "concept",
                      "descriptionLines": ["Line 1"],
                      "referenceKeys": ["Tech_A"],
                      "ignoredExporterEntryField": "future"
                    }
                  ]
                }
                """;

        mockMvc.perform(post("/api/admin/import/codex")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());

        assertNotNull(codexFacade.lastDto);
        assertEquals("Codex_A", codexFacade.lastDto.entries().getFirst().entryKey());
        assertEquals("Tech_A", codexFacade.lastDto.entries().getFirst().referenceKeys().getFirst());
    }

    private static QuestExplorerImportBatchDto questPayload(List<QuestExplorerImportEntryDto> entries) {
        return new QuestExplorerImportBatchDto(
                "0.80",
                "0.1.0",
                "now",
                "quest_explorer",
                "quest_explorer.v3",
                entries
        );
    }

    private static TechImportBatchDto techPayload(String exportKind, List<TechImportTechDto> techs) {
        return new TechImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "now",
                exportKind,
                techs
        );
    }

    private static TechImportTechDto tech(String techKey) {
        return new TechImportTechDto(
                techKey,
                "Tech A",
                null,
                false,
                1,
                "Discovery",
                List.of(),
                List.of(),
                List.of(),
                List.of()
        );
    }

    private static QuestExplorerImportEntryDto questEntry() {
        return new QuestExplorerImportEntryDto(
                "Quest_A",
                "A Quest",
                List.of("Summary"),
                "Curiosity",
                true,
                false,
                List.of("Source_A"),
                new QuestExplorerImportNavigationDto(
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        1,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of()
                ),
                new QuestExplorerImportLoreViewDto(List.of()),
                new QuestExplorerImportStrategyViewDto(List.of()),
                List.of(),
                null
        );
    }

    private static ImportSummaryDto okSummary(String kind) {
        return new ImportSummaryDto(
                kind,
                "2026-05-02T00:00:00Z",
                new ImportCountsDto(1, 1, 0, 0, 0, 0),
                new ImportDiagnosticsDto(List.of(), List.of(), null),
                1L
        );
    }

    private static ImportPreviewSummaryDto okSmokeSummary(String kind) {
        return new ImportPreviewSummaryDto(
                kind,
                1,
                1,
                1,
                0,
                0,
                List.of(),
                List.of()
        );
    }

    private static final class RecordingQuestExplorerImportAdminFacade implements QuestExplorerImportAdminFacade {
        private QuestExplorerImportBatchDto lastDto;
        private RuntimeException rejection;

        @Override
        public ImportSummaryDto importQuestExplorer(QuestExplorerImportBatchDto file) {
            if (rejection != null) {
                throw rejection;
            }
            lastDto = file;
            return okSummary("quest_explorer");
        }
    }

    private static final class RecordingCodexImportAdminFacade implements CodexImportAdminFacade {
        private CodexImportBatchDto lastDto;
        private RuntimeException rejection;

        @Override
        public ImportSummaryDto importCodex(CodexImportBatchDto file) {
            if (rejection != null) {
                throw rejection;
            }
            lastDto = file;
            return okSummary("codex");
        }
    }

    private static final class RecordingDistrictImportAdminFacade implements DistrictImportAdminFacade {
        private DistrictImportBatchDto lastDto;
        private RuntimeException rejection;

        @Override
        public ImportSummaryDto importDistricts(DistrictImportBatchDto file) {
            if (rejection != null) {
                throw rejection;
            }
            lastDto = file;
            return okSummary("districts");
        }
    }

    private static final class RecordingImprovementImportAdminFacade implements ImprovementImportAdminFacade {
        private ImprovementImportBatchDto lastDto;
        private RuntimeException rejection;

        @Override
        public ImportSummaryDto importImprovements(ImprovementImportBatchDto dto) {
            if (rejection != null) {
                throw rejection;
            }
            lastDto = dto;
            return okSummary("improvements");
        }
    }

    private static final class RecordingTechImportAdminFacade implements TechImportAdminFacade {
        private TechImportBatchDto lastImportDto;
        private TechImportBatchDto lastSmokeDto;
        private RuntimeException rejection;

        @Override
        public ImportSummaryDto importTechs(TechImportBatchDto file) {
            if (rejection != null) {
                throw rejection;
            }
            lastImportDto = file;
            return okSummary("tech");
        }

        @Override
        public ImportPreviewSummaryDto smokeTestTechs(TechImportBatchDto file) {
            lastSmokeDto = file;
            return okSmokeSummary("tech");
        }
    }

    private static final class RecordingUnitImportAdminFacade implements UnitImportAdminFacade {
        private UnitImportBatchDto lastImportDto;
        private UnitImportBatchDto lastSmokeDto;
        private boolean rejectImport;
        private RuntimeException rejection;

        @Override
        public ImportSummaryDto importUnits(UnitImportBatchDto dto) {
            if (rejection != null) {
                throw rejection;
            }
            if (rejectImport) {
                throw new IllegalStateException("Unit import produced 0 public units; refusing to write/delete.");
            }
            lastImportDto = dto;
            return okSummary("units");
        }

        @Override
        public ImportPreviewSummaryDto smokeTestUnits(UnitImportBatchDto dto) {
            lastSmokeDto = dto;
            return okSmokeSummary("units");
        }
    }
}
