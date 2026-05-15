package ewshop.app.seo;

import ewshop.app.seo.audit.CodexMissingReferenceAuditService;
import ewshop.app.seo.audit.CodexMissingReferenceAuditSummary;
import ewshop.app.seo.generation.ReferenceTargetBuilder;
import ewshop.app.seo.generation.SitemapGenerator;
import ewshop.app.seo.rendering.SeoPageRenderer;
import ewshop.app.seo.storage.GeneratedSeoWriter;
import ewshop.app.seo.storage.SeoOutputLocator;
import ewshop.domain.model.Codex;
import ewshop.domain.service.CodexFilterService;
import ewshop.domain.service.CodexService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SeoRegenerationServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void regeneratesSeoPagesAcrossExportKindsFromFilteredCodexData() throws Exception {
        CodexService codexService = mock(CodexService.class);
        SeoOutputLocator outputLocator = new SeoOutputLocator(tempDir.toString());
        SeoRegenerationService service = seoRegenerationService(codexService, outputLocator);

        when(codexService.getAllCodexEntries()).thenReturn(List.of(
                codexEntry("tech", "Technology_District_Tier1_Industry", "Workshop",
                        List.of(
                                "Unlocks district planning through early industry planning.",
                                "Category: Economy",
                                "+2 Industry per District Level"
                        ),
                        List.of("District_Klax", "Improvement_Workshop", "District_Workshop", "Industry")),
                codexEntry("tech", "Technology_City_Tier3_Defense", "Stonework",
                        List.of("Improves masonry logistics for defended cities.", "Category: Defense"),
                        List.of("City_Defense")),
                codexEntry("tech", "Technology_District_Tier1_Defense", "Stonework",
                        List.of("Unlocks fortified district construction."),
                        List.of("District_Rampart")),
                codexEntry("units", "Unit_Sentinel", "Sentinel",
                        List.of("A frontline unit that anchors army formations.", "Faction: Kin", "Role: Vanguard", "[Health] Health +20", "+3 MovementPoints Movement Points"),
                        List.of("Unit_Sentinel")),
                codexEntry("units", "Unit_Sentinel_Mk2", "Sentinel",
                        List.of("A second sentinel row that should be skipped."),
                        List.of("Unit_Sentinel_Mk2")),
                codexEntry("districts", "District_Klax", "[Luxury01] Klax Extractor",
                        List.of("Industrial district used for city specialization.", "Type: Infrastructure", "Prototype: District_Prototype_Tier1"),
                        List.of("District_Works")),
                codexEntry("improvements", "Improvement_Workshop", "Workshop",
                        List.of("Town improvement that supports early industry.", "Slot: Town", "Tier: 1"),
                        List.of("Improvement_Workshop")),
                codexEntry("tech", "Technology_Debug_Hidden", "% Debug Tech",
                        List.of("Hidden debug row."),
                        List.of("Debug")),
                codexEntry("districts", "District_Silent_Archive", "Silent Archive",
                        List.of(" ", "  "),
                        List.of("Archive"))
        ));

        Files.writeString(tempDir.resolve("tech.html"), "spa tech entry");
        Files.createDirectories(tempDir.resolve("tech/legacy-page"));
        Files.writeString(tempDir.resolve("tech/legacy-page/index.html"), "stale tech seo");
        Files.createDirectories(tempDir.resolve("units/legacy-unit"));
        Files.writeString(tempDir.resolve("units/legacy-unit/index.html"), "stale units seo");
        Files.createDirectories(tempDir.resolve("districts/legacy-district"));
        Files.writeString(tempDir.resolve("districts/legacy-district/index.html"), "stale districts seo");

        SeoRegenerationResult result = service.regeneratePrototypePages();

        Path workshopTechFile = tempDir.resolve("encyclopedia/tech/workshop/index.html");
        Path stoneworkTechFile = tempDir.resolve("encyclopedia/tech/stonework/index.html");
        Path stoneworkDistrictVariantFile = tempDir.resolve("encyclopedia/tech/stonework/technology-district-tier1-defense/index.html");
        Path sentinelUnitFile = tempDir.resolve("encyclopedia/units/sentinel/index.html");
        Path sentinelMk2VariantFile = tempDir.resolve("encyclopedia/units/sentinel/unit-sentinel-mk2/index.html");
        Path klaxDistrictFile = tempDir.resolve("encyclopedia/districts/klax-extractor/index.html");
        Path workshopImprovementFile = tempDir.resolve("encyclopedia/improvements/workshop/index.html");
        Path encyclopediaFile = tempDir.resolve("encyclopedia/index.html");
        Path encyclopediaTechFile = tempDir.resolve("encyclopedia/tech/index.html");
        Path sitemapFile = tempDir.resolve("sitemap.xml");
        Path auditJsonFile = tempDir.resolve("codex-missing-references-audit.json");
        Path auditMarkdownFile = tempDir.resolve("codex-missing-references-audit.md");

        assertThat(result.generatedCount()).isEqualTo(12);
        assertThat(result.generatedRoutes()).containsExactly(
                "/encyclopedia",
                "/encyclopedia/districts",
                "/encyclopedia/districts/klax-extractor",
                "/encyclopedia/improvements",
                "/encyclopedia/improvements/workshop",
                "/encyclopedia/tech",
                "/encyclopedia/tech/stonework",
                "/encyclopedia/tech/stonework/technology-district-tier1-defense",
                "/encyclopedia/tech/workshop",
                "/encyclopedia/units",
                "/encyclopedia/units/sentinel",
                "/encyclopedia/units/sentinel/unit-sentinel-mk2"
        );
        assertThat(result.skippedCount()).isEqualTo(2);
        assertThat(result.duplicateCount()).isZero();
        assertThat(result.skippedByReason()).isEqualTo(Map.of(
                "invalid-display-name", 1,
                "weak-description-lines", 1,
                "filtered-out", 2
        ));
        assertThat(result.exportKindCounts()).containsExactlyInAnyOrderEntriesOf(Map.of(
                "tech", new SeoRegenerationKindResult(3, 1, 0),
                "units", new SeoRegenerationKindResult(2, 0, 0),
                "districts", new SeoRegenerationKindResult(1, 1, 0),
                "improvements", new SeoRegenerationKindResult(1, 0, 0)
        ));
        CodexMissingReferenceAuditSummary missingReferenceAudit = result.missingReferenceAudit();
        assertThat(missingReferenceAudit.artifact()).isEqualTo("codex-missing-references-audit.json");
        assertThat(missingReferenceAudit.unresolvedReferences()).isEqualTo(5);
        assertThat(missingReferenceAudit.resolutionPercentage()).isEqualTo(50.0);
        assertThat(missingReferenceAudit.topUnresolvedCategories())
                .containsExactly("District: 3", "City: 1", "Unclassified: 1");
        assertThat(missingReferenceAudit.ownershipBuckets())
                .extracting(CodexMissingReferenceAuditSummary.CodexMissingReferenceOwnershipSummary::classification)
                .contains("absent-from-import");
        assertThat(missingReferenceAudit.duplicateAliasImpact().resolvedReferences()).isZero();
        assertThat(result.warnings()).isEmpty();
        assertThat(result.errors()).isEmpty();
        assertThat(result.sitemapUpdated()).isTrue();

        assertThat(workshopTechFile).exists();
        String workshopTechHtml = Files.readString(workshopTechFile);
        assertThat(workshopTechHtml).contains("Workshop Technology Reference | Endless Workshop");
        assertThat(workshopTechHtml).contains("Home");
        assertThat(workshopTechHtml).containsSubsequence(
                "<div class=\"entity-page__breadcrumbs\" aria-label=\"Breadcrumb\">",
                "<a href=\"/\">Home</a>",
                "<a href=\"/encyclopedia\">Encyclopedia</a>",
                "<a href=\"/encyclopedia/tech\">Technologies</a>",
                "<span>Workshop</span>"
        );
        assertThat(workshopTechHtml).contains("Technology • Category: Economy");
        assertThat(workshopTechHtml).contains("<p class=\"seo-text entity-page__summary\">Unlocks district planning through early industry planning.</p>");
        assertThat(workshopTechHtml).contains("<h2 class=\"seo-heading\">Description</h2>");
        assertThat(workshopTechHtml).doesNotContain(">Details<");
        assertThat(workshopTechHtml).doesNotContain("<p class=\"seo-label\">Description</p>");
        assertThat(workshopTechHtml).doesNotContain(">Explore<");
        assertThat(workshopTechHtml).doesNotContain("Entry key:");
        assertThat(workshopTechHtml).doesNotContain("Canonical route:");
        assertThat(workshopTechHtml).doesNotContain("<li>Unlocks district planning through early industry planning.</li>");
        assertThat(workshopTechHtml).contains("+2 Industry per District Level");
        assertThat(workshopTechHtml).contains(">Related<");
        assertThat(workshopTechHtml).contains("<a class=\"seo-chip\" href=\"/encyclopedia/districts/klax-extractor\" data-entry-key=\"District_Klax\">Klax Extractor</a>");
        assertThat(workshopTechHtml).contains("<a class=\"seo-chip\" href=\"/encyclopedia/improvements/workshop\" data-entry-key=\"Improvement_Workshop\">Workshop</a>");
        assertThat(workshopTechHtml).doesNotContain("data-entry-key=\"District_Workshop\"");
        assertThat(workshopTechHtml).doesNotContain("data-entry-key=\"Industry\"");
        assertThat(workshopTechHtml).doesNotContain(">District_Klax<");
        assertThat(workshopTechHtml).doesNotContain(">Improvement_Workshop<");
        assertThat(workshopTechHtml).contains("Back to Codex");
        assertThat(workshopTechHtml).doesNotContain("<a class=\"seo-linkButton entity-page__actionLink\" href=\"/encyclopedia\">Encyclopedia</a>");
        assertThat(workshopTechHtml).doesNotContain("<a class=\"seo-linkButton entity-page__actionLink\" href=\"/encyclopedia/tech\">Browse Technologies</a>");
        assertThat(workshopTechHtml).contains("Browse Tech");
        assertThat(workshopTechHtml).contains("<link rel=\"canonical\" href=\"https://endlessworkshop.dev/encyclopedia/tech/workshop\" />");
        assertThat(workshopTechHtml).contains("\"@type\":\"WebPage\"");
        assertThat(workshopTechHtml).contains("\"@type\":\"BreadcrumbList\"");
        assertThat(workshopTechHtml).contains("\"name\":\"Encyclopedia\",\"item\":\"https://endlessworkshop.dev/encyclopedia\"");
        assertThat(workshopTechHtml).contains("\"name\":\"Technologies\",\"item\":\"https://endlessworkshop.dev/encyclopedia/tech\"");
        assertThat(workshopTechHtml).doesNotContain("src/index.tsx");
        assertThat(workshopTechHtml).doesNotContain("fetch(");
        assertThat(workshopTechHtml).doesNotContain("/api/");
        assertThat(workshopTechHtml).doesNotContain("type=\"module\"");
        assertThat(workshopTechHtml).doesNotContain("<style");

        assertThat(stoneworkTechFile).exists();
        assertThat(Files.readString(stoneworkTechFile))
                .contains("https://endlessworkshop.dev/encyclopedia/tech/stonework")
                .contains("Improves masonry logistics for defended cities.")
                .doesNotContain("Unlocks fortified district construction.");

        assertThat(stoneworkDistrictVariantFile).exists();
        assertThat(Files.readString(stoneworkDistrictVariantFile))
                .contains("Stonework - Tier1 Defense Technology Reference | Endless Workshop")
                .contains("<link rel=\"canonical\" href=\"https://endlessworkshop.dev/encyclopedia/tech/stonework/technology-district-tier1-defense\" />")
                .contains("Unlocks fortified district construction.");

        assertThat(sentinelUnitFile).exists();
        assertThat(Files.readString(sentinelUnitFile))
                .contains("Sentinel Unit Reference | Endless Workshop")
                .contains("Unit • Faction: Kin • Role: Vanguard")
                .contains("Health +20")
                .contains("Movement Points")
                .doesNotContain("MovementPoints Movement Points")
                .contains("Browse Units")
                .contains("<link rel=\"canonical\" href=\"https://endlessworkshop.dev/encyclopedia/units/sentinel\" />")
                .doesNotContain("href=\"/encyclopedia/units\">Browse Units</a>");

        assertThat(sentinelMk2VariantFile).exists();
        assertThat(Files.readString(sentinelMk2VariantFile))
                .contains("Sentinel - Sentinel Mk2 Unit Reference | Endless Workshop")
                .contains("<link rel=\"canonical\" href=\"https://endlessworkshop.dev/encyclopedia/units/sentinel/unit-sentinel-mk2\" />")
                .contains("A second sentinel row that should be skipped.");

        assertThat(klaxDistrictFile).exists();
        assertThat(Files.readString(klaxDistrictFile))
                .contains("Klax Extractor District Reference | Endless Workshop")
                .contains("District • Type: Infrastructure")
                .contains("Back to Codex")
                .doesNotContain("Luxury01")
                .doesNotContain("Prototype: District_Prototype_Tier1")
                .doesNotContain("Prototype •")
                .doesNotContain("Browse Tech")
                .doesNotContain("Browse Units")
                .contains("<link rel=\"canonical\" href=\"https://endlessworkshop.dev/encyclopedia/districts/klax-extractor\" />");

        assertThat(workshopImprovementFile).exists();
        assertThat(Files.readString(workshopImprovementFile))
                .contains("Workshop Improvement Reference | Endless Workshop")
                .contains("https://endlessworkshop.dev/encyclopedia/improvements/workshop");

        assertThat(encyclopediaFile).exists();
        assertThat(Files.readString(encyclopediaFile))
                .contains("Codex Overview")
                .contains("<a class=\"encyclopedia-page__categoryRow\" href=\"/encyclopedia/tech\">")
                .contains("<span class=\"encyclopedia-page__categoryName\">Technologies</span>")
                .contains("<span class=\"encyclopedia-page__categoryCount\">2</span>");

        assertThat(encyclopediaTechFile).exists();
        assertThat(Files.readString(encyclopediaTechFile))
                .contains("Technologies Encyclopedia | Endless Workshop")
                .contains("<a class=\"encyclopedia-page__entryRow\" href=\"/encyclopedia/tech/workshop\" data-entry-key=\"Technology_District_Tier1_Industry\">")
                .contains("<span class=\"encyclopedia-page__entryTitle\">Workshop</span>")
                .contains("Unlocks district planning through early industry planning.")
                .contains("<a class=\"encyclopedia-page__entryRow\" href=\"/encyclopedia/tech/stonework\" data-entry-key=\"Technology_City_Tier3_Defense\">")
                .contains("<a class=\"encyclopedia-page__entryRow\" href=\"/encyclopedia/tech/stonework/technology-district-tier1-defense\" data-entry-key=\"Technology_District_Tier1_Defense\">");

        assertThat(tempDir.resolve("tech/legacy-page/index.html")).doesNotExist();
        assertThat(tempDir.resolve("units/legacy-unit/index.html")).doesNotExist();
        assertThat(tempDir.resolve("districts/legacy-district/index.html")).doesNotExist();
        assertThat(tempDir.resolve("tech.html")).hasContent("spa tech entry");

        assertThat(sitemapFile).exists();
        assertThat(Files.readString(sitemapFile)).containsSubsequence(
                "<loc>https://endlessworkshop.dev/tech</loc>",
                "<loc>https://endlessworkshop.dev/units</loc>",
                "<loc>https://endlessworkshop.dev/codex</loc>",
                "<loc>https://endlessworkshop.dev/summary</loc>",
                "<loc>https://endlessworkshop.dev/mods</loc>",
                "<loc>https://endlessworkshop.dev/info</loc>",
                "<loc>https://endlessworkshop.dev/encyclopedia</loc>",
                "<loc>https://endlessworkshop.dev/encyclopedia/districts</loc>",
                "<loc>https://endlessworkshop.dev/encyclopedia/improvements</loc>",
                "<loc>https://endlessworkshop.dev/encyclopedia/tech</loc>",
                "<loc>https://endlessworkshop.dev/encyclopedia/units</loc>",
                "<loc>https://endlessworkshop.dev/encyclopedia/districts/klax-extractor</loc>",
                "<loc>https://endlessworkshop.dev/encyclopedia/improvements/workshop</loc>",
                "<loc>https://endlessworkshop.dev/encyclopedia/tech/stonework</loc>",
                "<loc>https://endlessworkshop.dev/encyclopedia/tech/stonework/technology-district-tier1-defense</loc>",
                "<loc>https://endlessworkshop.dev/encyclopedia/tech/workshop</loc>",
                "<loc>https://endlessworkshop.dev/encyclopedia/units/sentinel</loc>",
                "<loc>https://endlessworkshop.dev/encyclopedia/units/sentinel/unit-sentinel-mk2</loc>"
        );
        assertThat(Files.readString(sitemapFile)).doesNotContain("legacy-page");
        assertThat(Files.readString(sitemapFile)).doesNotContain("<loc>https://endlessworkshop.dev/tech/workshop</loc>");
        assertThat(Files.readString(sitemapFile)).doesNotContain("<loc>https://endlessworkshop.dev/units/sentinel</loc>");
        assertThat(Files.readString(sitemapFile)).doesNotContain("codex-missing-references-audit");

        assertThat(auditJsonFile).exists();
        String auditJson = Files.readString(auditJsonFile);
        assertThat(auditJson)
                .contains("\"totalEntriesScanned\": 7")
                .contains("\"totalReferenceKeysScanned\": 10")
                .contains("\"totalResolvedReferences\": 5")
                .contains("\"totalUnresolvedReferences\": 5")
                .contains("\"resolutionPercentage\": 50.0")
                .contains("\"categoryPrefix\": \"District\"")
                .contains("\"unresolvedCount\": 3")
                .contains("\"percentageOfTotalUnresolved\": 60.0")
                .contains("\"exampleKeys\": [")
                .contains("\"District_Rampart\"")
                .contains("\"District_Workshop\"")
                .contains("\"District_Works\"")
                .contains("\"exampleSourcePages\": [")
                .contains("\"/encyclopedia/districts/klax-extractor\"")
                .contains("\"/encyclopedia/tech/stonework/technology-district-tier1-defense\"")
                .contains("\"/encyclopedia/tech/workshop\"")
                .contains("\"recommendation\": \"public SEO/indexable pages\"")
                .contains("\"categoryPrefix\": \"City\"")
                .contains("\"categoryPrefix\": \"Unclassified\"")
                .contains("\"hiddenPillboxesUnlockedEstimate\": 3");
        assertThat(auditJson.indexOf("\"categoryPrefix\": \"District\""))
                .isLessThan(auditJson.indexOf("\"categoryPrefix\": \"City\""));

        assertThat(auditMarkdownFile).exists();
        assertThat(Files.readString(auditMarkdownFile))
                .contains("# Codex Missing References Audit")
                .contains("- Total unresolved references: 5")
                .contains("### District");
    }

    @Test
    void canonicalizesPureDuplicateVariantsWithoutAddingThemToSitemap() throws Exception {
        CodexService codexService = mock(CodexService.class);
        SeoOutputLocator outputLocator = new SeoOutputLocator(tempDir.toString());
        SeoRegenerationService service = seoRegenerationService(codexService, outputLocator);

        when(codexService.getAllCodexEntries()).thenReturn(List.of(
                codexEntry("abilities", "UnitAbility_FlightBase", "Flight",
                        List.of("Unit ignores terrain movement penalties."),
                        List.of("UnitAbility_LandMovement")),
                codexEntry("abilities", "UnitAbility_Fly", "Flight",
                        List.of("Unit ignores terrain movement penalties."),
                        List.of("UnitAbility_LandMovement"))
        ));

        SeoRegenerationResult result = service.regeneratePrototypePages();

        Path representativeFile = tempDir.resolve("encyclopedia/abilities/flight/index.html");
        Path duplicateFile = tempDir.resolve("encyclopedia/abilities/flight/unitability-fly/index.html");
        String representativeHtml = Files.readString(representativeFile);
        String duplicateHtml = Files.readString(duplicateFile);
        String sitemap = Files.readString(tempDir.resolve("sitemap.xml"));

        assertThat(result.generatedRoutes()).contains(
                "/encyclopedia/abilities/flight",
                "/encyclopedia/abilities/flight/unitability-fly"
        );
        assertThat(result.duplicateCount()).isEqualTo(1);
        assertThat(result.skippedByReason()).containsEntry("canonicalized-duplicate", 1);
        assertThat(representativeHtml)
                .contains("<link rel=\"canonical\" href=\"https://endlessworkshop.dev/encyclopedia/abilities/flight\" />")
                .contains(">Also Covers<")
                .contains("Flight - Fly");
        assertThat(duplicateHtml)
                .contains("<meta name=\"robots\" content=\"noindex, follow\" />")
                .contains("<link rel=\"canonical\" href=\"https://endlessworkshop.dev/encyclopedia/abilities/flight\" />");
        assertThat(sitemap)
                .contains("<loc>https://endlessworkshop.dev/encyclopedia/abilities/flight</loc>")
                .doesNotContain("<loc>https://endlessworkshop.dev/encyclopedia/abilities/flight/unitability-fly</loc>");
    }

    @Test
    void questDuplicateVariantTitlesIncludeStableStepContext() throws Exception {
        CodexService codexService = mock(CodexService.class);
        SeoOutputLocator outputLocator = new SeoOutputLocator(tempDir.toString());
        SeoRegenerationService service = seoRegenerationService(codexService, outputLocator);

        when(codexService.getAllCodexEntries()).thenReturn(List.of(
                Codex.builder()
                        .exportKind("quests")
                        .entryKey("FactionQuest_Necrophage02_Chapter06_Step01")
                        .displayName("A Bitter Truth")
                        .category("MajorFaction")
                        .kind("Quest")
                        .descriptionLines(List.of("The swarm begins the search."))
                        .referenceKeys(List.of("FactionQuest_Necrophage02_Chapter06_Step02"))
                        .build(),
                Codex.builder()
                        .exportKind("quests")
                        .entryKey("FactionQuest_Necrophage02_Chapter06_Step02")
                        .displayName("A Bitter Truth")
                        .category("MajorFaction")
                        .kind("Quest")
                        .descriptionLines(List.of("The swarm presses onward."))
                        .referenceKeys(List.of("FactionQuest_Necrophage02_Chapter06_Step03_Choice01"))
                        .build(),
                Codex.builder()
                        .exportKind("quests")
                        .entryKey("FactionQuest_Necrophage02_Chapter06_Step03_Choice01")
                        .displayName("A Bitter Truth")
                        .category("MajorFaction")
                        .kind("Quest")
                        .descriptionLines(List.of("The swarm chooses violence."))
                        .referenceKeys(List.of())
                        .build()
        ));

        service.regeneratePrototypePages();

        String representativeHtml = Files.readString(tempDir.resolve("encyclopedia/quests/a-bitter-truth/index.html"));
        String stepHtml = Files.readString(tempDir.resolve("encyclopedia/quests/a-bitter-truth/factionquest-necrophage02-chapter06-step02/index.html"));
        String choiceHtml = Files.readString(tempDir.resolve("encyclopedia/quests/a-bitter-truth/factionquest-necrophage02-chapter06-step03-choice01/index.html"));

        assertThat(representativeHtml)
                .contains("A Bitter Truth Quest Reference | Endless Workshop")
                .contains("<a class=\"seo-chip\" href=\"/encyclopedia/quests/a-bitter-truth/factionquest-necrophage02-chapter06-step02\" data-entry-key=\"FactionQuest_Necrophage02_Chapter06_Step02\">A Bitter Truth</a>");
        assertThat(stepHtml)
                .contains("A Bitter Truth - Necrophage02 Chapter 06 Step 02 MajorFaction Quest Quest Reference | Endless Workshop")
                .contains("<h1 class=\"seo-heading entity-page__title\">A Bitter Truth - Necrophage02 Chapter 06 Step 02 MajorFaction Quest</h1>")
                .contains("<a class=\"seo-chip\" href=\"/encyclopedia/quests/a-bitter-truth/factionquest-necrophage02-chapter06-step03-choice01\" data-entry-key=\"FactionQuest_Necrophage02_Chapter06_Step03_Choice01\">A Bitter Truth</a>");
        assertThat(choiceHtml)
                .contains("A Bitter Truth - Necrophage02 Chapter 06 Step 03 Choice 01 MajorFaction Quest Quest Reference | Endless Workshop")
                .contains("<h1 class=\"seo-heading entity-page__title\">A Bitter Truth - Necrophage02 Chapter 06 Step 03 Choice 01 MajorFaction Quest</h1>");
    }

    @Test
    void tracksDuplicateSlugsPerExportKindInsteadOfGlobally() throws Exception {
        CodexService codexService = mock(CodexService.class);
        SeoOutputLocator outputLocator = new SeoOutputLocator(tempDir.toString());
        SeoRegenerationService service = seoRegenerationService(codexService, outputLocator);

        when(codexService.getAllCodexEntries()).thenReturn(List.of(
                codexEntry("tech", "Technology_A", "Workshop", List.of("Tech description."), List.of()),
                codexEntry("units", "Unit_A", "Workshop", List.of("Unit description."), List.of())
        ));

        SeoRegenerationResult result = service.regeneratePrototypePages();
        String workshopUnitHtml = Files.readString(tempDir.resolve("encyclopedia/units/workshop/index.html"));

        assertThat(result.generatedRoutes()).containsExactly(
                "/encyclopedia",
                "/encyclopedia/tech",
                "/encyclopedia/tech/workshop",
                "/encyclopedia/units",
                "/encyclopedia/units/workshop"
        );
        assertThat(result.skippedCount()).isZero();
        assertThat(result.duplicateCount()).isZero();
        assertThat(workshopUnitHtml).doesNotContain(">Related<");
        assertThat(workshopUnitHtml).doesNotContain(">Explore<");
        assertThat(workshopUnitHtml).contains("Back to Codex");
        assertThat(workshopUnitHtml).contains("Browse Units");
        assertThat(result.exportKindCounts()).containsExactlyInAnyOrderEntriesOf(Map.of(
                "tech", new SeoRegenerationKindResult(1, 0, 0),
                "units", new SeoRegenerationKindResult(1, 0, 0)
        ));
    }

    @Test
    void missingReferenceAuditGroupsCategoriesAndUsesDeterministicOutput() throws Exception {
        CodexService codexService = mock(CodexService.class);
        SeoOutputLocator outputLocator = new SeoOutputLocator(tempDir.toString());
        SeoRegenerationService service = seoRegenerationService(codexService, outputLocator);

        when(codexService.getAllCodexEntries()).thenReturn(List.of(
                codexEntry("units", "Unit_A", "Alpha",
                        List.of("Alpha has multiple unresolved combat links."),
                        List.of("UnitAbility_Strike", "BattleAbility_Guard", "ActiveSkill_Charge", "Effect_Bleed")),
                codexEntry("units", "Unit_B", "Beta",
                        List.of("Beta references the existing alpha unit."),
                        List.of("Unit_A", "Descriptor_Fast", "Tag_Frontline")),
                codexEntry("tech", "Technology_A", "Foundry",
                        List.of("Foundry unlocks production systems."),
                        List.of("DistrictImprovement_Smelter", "Resource_Iron", "FactionTrait_Industry")),
                codexEntry("populations", "Population_A", "Worker",
                        List.of("Worker population supports city economies."),
                        List.of("PopulationCategory_Worker", "FactionAffinity_Order", "Shape_Cone", "UnitClass_Infantry"))
        ));

        service.regeneratePrototypePages();
        String firstJson = Files.readString(tempDir.resolve("codex-missing-references-audit.json"));
        service.regeneratePrototypePages();
        String secondJson = Files.readString(tempDir.resolve("codex-missing-references-audit.json"));

        assertThat(secondJson).isEqualTo(firstJson);
        assertThat(firstJson)
                .contains("\"totalEntriesScanned\": 4")
                .contains("\"totalReferenceKeysScanned\": 14")
                .contains("\"totalResolvedReferences\": 1")
                .contains("\"totalUnresolvedReferences\": 13")
                .contains("\"categoryPrefix\": \"ActiveSkill\"")
                .contains("\"categoryPrefix\": \"BattleAbility\"")
                .contains("\"categoryPrefix\": \"Descriptor\"")
                .contains("\"categoryPrefix\": \"DistrictImprovement\"")
                .contains("\"categoryPrefix\": \"Effect\"")
                .contains("\"categoryPrefix\": \"FactionAffinity\"")
                .contains("\"categoryPrefix\": \"FactionTrait\"")
                .contains("\"categoryPrefix\": \"PopulationCategory\"")
                .contains("\"categoryPrefix\": \"Resource\"")
                .contains("\"categoryPrefix\": \"Shape\"")
                .contains("\"categoryPrefix\": \"Tag\"")
                .contains("\"categoryPrefix\": \"UnitAbility\"")
                .contains("\"categoryPrefix\": \"UnitClass\"")
                .contains("\"recommendation\": \"related-link-only semantic entities\"")
                .contains("\"recommendation\": \"metadata-only/non-public entities\"")
                .contains("\"sourceKindAnalysis\": [")
                .contains("\"kind\": \"units\"")
                .contains("\"isolatedKindAnalysis\": [");
    }

    @Test
    void missingReferenceAuditClassifiesOwnershipOfUnresolvedReferences() throws Exception {
        CodexService codexService = mock(CodexService.class);
        SeoOutputLocator outputLocator = new SeoOutputLocator(tempDir.toString());
        SeoRegenerationService service = seoRegenerationService(codexService, outputLocator);

        when(codexService.getAllCodexEntries()).thenReturn(List.of(
                codexEntry("abilities", "UnitAbility_FlightBase", "Flight",
                        List.of("Baseline flight entry kept by duplicate-slug filtering."),
                        List.of()),
                codexEntry("abilities", "UnitAbility_Fly", "Flight",
                        List.of("Duplicate flight entry that remains imported but filtered."),
                        List.of()),
                codexEntry("populations", "Population_Minor_Ametrine", "Ametrine",
                        List.of("Ametrine population exists under a population key."),
                        List.of()),
                codexEntry("units", "Unit_A", "Alpha",
                        List.of("Alpha references filtered, near-match, internal, and absent keys."),
                        List.of(
                                "UnitAbility_Fly",
                                "MinorFaction_Ametrine",
                                "UnitAbility_LandMovement",
                                "Missing_Clear"
                        ))
        ));

        SeoRegenerationResult result = service.regeneratePrototypePages();

        String json = Files.readString(tempDir.resolve("codex-missing-references-audit.json"));
        String markdown = Files.readString(tempDir.resolve("codex-missing-references-audit.md"));
        CodexMissingReferenceAuditSummary summary = result.missingReferenceAudit();

        assertThat(json)
                .contains("\"schemaVersion\": 2")
                .contains("\"ownershipClassification\": [")
                .contains("\"classification\": \"absent-from-import\"")
                .contains("\"referenceKey\": \"Missing_Clear\"")
                .contains("\"classification\": \"near-match / present-under-other-key\"")
                .contains("\"referenceKey\": \"MinorFaction_Ametrine\"")
                .contains("\"nearMatches\": [\n                    \"Population_Minor_Ametrine\"")
                .contains("\"classification\": \"internal/noise\"")
                .contains("\"referenceKey\": \"UnitAbility_LandMovement\"")
                .doesNotContain("\"referenceKey\": \"UnitAbility_Fly\"");
        assertThat(markdown)
                .contains("## Ownership classification")
                .doesNotContain("present-but-filtered");
        assertThat(summary.ownershipBuckets())
                .extracting(CodexMissingReferenceAuditSummary.CodexMissingReferenceOwnershipSummary::classification)
                .containsExactly(
                        "absent-from-import",
                        "internal/noise",
                        "near-match / present-under-other-key"
                );
        assertThat(summary.presentButFilteredReasons()).isEmpty();
        assertThat(summary.duplicateAliasImpact().resolvedReferences()).isZero();
        assertThat(summary.duplicateAliasImpact().examples()).isEmpty();
    }

    private static Codex codexEntry(
            String exportKind,
            String entryKey,
            String displayName,
            List<String> descriptionLines,
            List<String> referenceKeys
    ) {
        return Codex.builder()
                .exportKind(exportKind)
                .entryKey(entryKey)
                .displayName(displayName)
                .descriptionLines(descriptionLines)
                .referenceKeys(referenceKeys)
                .build();
    }

    private static SeoRegenerationService seoRegenerationService(
            CodexService codexService,
            SeoOutputLocator outputLocator
    ) {
        return new SeoRegenerationService(
                codexService,
                new CodexFilterService(),
                outputLocator,
                new CodexMissingReferenceAuditService(),
                new ReferenceTargetBuilder(),
                new SeoPageRenderer(),
                new SitemapGenerator(),
                new GeneratedSeoWriter(outputLocator)
        );
    }
}
