package ewshop.facade.integration;

import ewshop.facade.dto.importing.codex.CodexImportBatchDto;
import ewshop.facade.dto.importing.factions.FactionImportBatchDto;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;
import ewshop.facade.dto.importing.units.UnitImportBatchDto;
import ewshop.facade.interfaces.CodexFacade;
import ewshop.facade.interfaces.CodexImportAdminFacade;
import ewshop.facade.interfaces.FactionFacade;
import ewshop.facade.interfaces.FactionImportAdminFacade;
import ewshop.facade.interfaces.TechFacade;
import ewshop.facade.interfaces.TechImportAdminFacade;
import ewshop.facade.interfaces.UnitFacade;
import ewshop.facade.interfaces.UnitImportAdminFacade;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LiveFactionImportIntegrationTest extends BaseIT {

    private static final ObjectMapper JSON = JsonMapper.builder()
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES).build();

    @Autowired
    private FactionImportAdminFacade factionImport;
    @Autowired
    private FactionFacade factions;
    @Autowired
    private UnitImportAdminFacade unitImport;
    @Autowired
    private UnitFacade units;
    @Autowired
    private TechImportAdminFacade techImport;
    @Autowired
    private TechFacade techs;
    @Autowired
    private CodexImportAdminFacade codexImport;
    @Autowired
    private CodexFacade codex;

    @Test
    void importsNewMajorMinorAndAlternateFactionsThroughPersistenceAndPublicDtos() throws Exception {
        factionImport.importFactions(JSON.readValue("""
                {"exportKind":"factions","factions":[
                  {"factionKey":"Faction_SandShaper","factionKind":"major","publicDisplayName":"Sandshapers",
                   "affinityKey":"FactionAffinity_SandShaper","traitKeys":["FactionTrait_SandShaper_Wishes"]},
                  {"factionKey":"Faction_KinOfSheredyn02","factionKind":"major","publicDisplayName":"Kin Alternate",
                   "affinityKey":"FactionAffinity_KinOfSheredyn"},
                  {"factionKey":"MinorFaction_NewPeople","factionKind":"minor","publicDisplayName":"New People"},
                  {"factionKey":"Faction_Prototype"}
                ]}
                """, FactionImportBatchDto.class));
        unitImport.importUnits(JSON.readValue("""
                {"exportKind":"units","units":[
                  {"unitKey":"Unit_SandShaper","displayName":"Sand Scout","faction":"SandShaper","isMajorFaction":true},
                  {"unitKey":"Unit_Alternate","displayName":"Alternate Scout","faction":"KinOfSheredyn02","isMajorFaction":true},
                  {"unitKey":"Unit_NewPeople","displayName":"New Scout","faction":"NewPeople","isMajorFaction":false},
                  {"unitKey":"Unit_Prototype","displayName":"Prototype","faction":"SandShaper","isMajorFaction":true}
                ]}
                """, UnitImportBatchDto.class));
        techImport.importTechs(JSON.readValue("""
                {"exportKind":"tech","techs":[
                  {"techKey":"Technology_Common","displayName":"Common Wisdom","quadrant":"Society"},
                  {"techKey":"Technology_Sand","displayName":"Sand Wisdom","quadrant":"Society",
                   "factionTraitPrerequisites":[{"operator":"Any","traitKey":"FactionAffinity_SandShaper"}]},
                  {"techKey":"Technology_Prototype","quadrant":"Society"}
                ]}
                """, TechImportBatchDto.class));
        codexImport.importCodex(JSON.readValue("""
                {"exportKind":"actions","entries":[
                  {"entryKey":"FactionActionTypeSandShaper_Wishes01","displayName":"Wish",
                   "referenceKeys":["Faction_SandShaper"],"publicContextKeys":["Faction_SandShaper"]},
                  {"entryKey":"FactionActionTypeKinOfSheredyn02_NewAction","displayName":"Alternate Action","descriptionLines":["An alternate faction action."]},
                  {"entryKey":"Action_NewPrototype","displayName":"Prototype","isPrototype":true}
                ]}
                """, CodexImportBatchDto.class));

        assertThat(factions.getAllFactions()).extracting("factionKey")
                .containsExactlyInAnyOrder("Faction_SandShaper", "Faction_KinOfSheredyn02", "MinorFaction_NewPeople");
        assertThat(units.getAllUnits()).extracting("faction")
                .containsExactlyInAnyOrder("Sand Shaper", "Kin Of Sheredyn02", "New People");
        assertThat(techs.getAllTechs()).hasSize(2);
        assertThat(techs.getAllTechs()).filteredOn(tech -> tech.techKey().equals("Technology_Common"))
                .singleElement().satisfies(tech -> assertThat(tech.factions()).containsExactlyInAnyOrder("Sand Shaper", "Kin Of Sheredyn02"));
        assertThat(techs.getAllTechs()).filteredOn(tech -> tech.techKey().equals("Technology_Sand"))
                .singleElement().satisfies(tech -> assertThat(tech.factions()).containsExactly("Sand Shaper"));
        assertThat(codex.getAllCodexEntries()).extracting("entryKey")
                .containsExactlyInAnyOrder("FactionActionTypeSandShaper_Wishes01", "FactionActionTypeKinOfSheredyn02_NewAction");
        assertThat(codex.getAllCodexEntries()).filteredOn(entry -> entry.entryKey().contains("SandShaper"))
                .singleElement().satisfies(entry -> {
                    assertThat(entry.referenceKeys()).containsExactly("Faction_SandShaper");
                    assertThat(entry.publicContextKeys()).containsExactly("Faction_SandShaper");
                });
    }

    @Test
    void exposesThinFactionRecordsWithoutPrototypeOrEnumGates() throws Exception {
        codexImport.importCodex(JSON.readValue("""
                {"exportKind":"factions","entries":[
                  {"entryKey":"Faction_SandShaper","displayName":"Sandshapers"},
                  {"entryKey":"Faction_KinOfSheredyn102","displayName":"Kin 102"},
                  {"entryKey":"Faction_Helper","displayName":"Helper","isInternal":true}
                ]}
                """, CodexImportBatchDto.class));
        assertThat(codex.getAllCodexEntries()).extracting("entryKey")
                .containsExactlyInAnyOrder("Faction_SandShaper", "Faction_KinOfSheredyn102");
    }

    @Test
    void malformedUnitAndTechSnapshotsLeavePreviouslyImportedDataIntact() throws Exception {
        unitImport.importUnits(JSON.readValue("""
                {"exportKind":"units","units":[
                  {"unitKey":"Unit_Previous","displayName":"Previous","faction":"SandShaper","isMajorFaction":true}
                ]}
                """, UnitImportBatchDto.class));
        UnitImportBatchDto invalidUnits = JSON.readValue("""
                {"exportKind":"units","units":[
                  {"unitKey":"Unit_New","displayName":"New","faction":"SandShaper","isMajorFaction":true},
                  {"displayName":"Missing key","faction":"SandShaper","isMajorFaction":true}
                ]}
                """, UnitImportBatchDto.class);
        assertThatThrownBy(() -> unitImport.importUnits(invalidUnits)).isInstanceOf(IllegalArgumentException.class);
        assertThat(units.getAllUnits()).extracting("unitKey").containsExactly("Unit_Previous");

        techImport.importTechs(JSON.readValue("""
                {"exportKind":"tech","techs":[{"techKey":"Technology_Previous","displayName":"Previous Wisdom","quadrant":"Society"}]}
                """, TechImportBatchDto.class));
        TechImportBatchDto invalidTechs = JSON.readValue("""
                {"exportKind":"tech","techs":[
                  {"techKey":"Technology_New","displayName":"New Wisdom","quadrant":"Society"},{"techKey":"Technology_Invalid"}
                ]}
                """, TechImportBatchDto.class);
        assertThatThrownBy(() -> techImport.importTechs(invalidTechs)).isInstanceOf(IllegalArgumentException.class);
        assertThat(techs.getAllTechs()).extracting("techKey").containsExactly("Technology_Previous");
    }
}
