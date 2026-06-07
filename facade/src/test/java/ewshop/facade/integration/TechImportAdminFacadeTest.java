package ewshop.facade.integration;

import ewshop.domain.model.TechCoords;
import ewshop.domain.model.enums.TechType;
import ewshop.facade.dto.importing.ImportPreviewSummaryDto;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;
import ewshop.facade.dto.importing.tech.TechImportTechDto;
import ewshop.facade.dto.importing.tech.TechImportUnlockDto;
import ewshop.facade.dto.response.TechDto;
import ewshop.facade.interfaces.TechFacade;
import ewshop.facade.interfaces.TechImportAdminFacade;
import ewshop.infrastructure.persistence.entities.TechEntity;
import ewshop.infrastructure.persistence.repositories.TechJpaRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TechImportAdminFacadeTest extends BaseIT {

    @Autowired
    private TechImportAdminFacade techImportAdminFacade;

    @Autowired
    private TechFacade techFacade;

    @Autowired
    private TechJpaRepository techJpaRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @AfterEach
    void tearDown() {
        techJpaRepository.deleteAll();
    }

    @Test
    void contextLoads() {
        assertThat(techImportAdminFacade).isNotNull();
        assertThat(techJpaRepository).isNotNull();
    }

    @Test
    void importTechs_shouldOverwriteName_butPreserveCoords_whenTechAlreadyExists_andUpdateBaselineFields() {

        // given
        TechEntity existing = new TechEntity();
        existing.setTechKey("Technology_X");
        existing.setName("Curated Name");
        existing.setTechCoords(new TechCoords(10.0, 20.0));
        existing.setEra(1);
        existing.setType(TechType.SOCIETY);
        existing.setLore("Old lore");
        existing.setHidden(false);

        techJpaRepository.save(existing);
        entityManager.flush();
        entityManager.clear();

        TechImportTechDto dto = new TechImportTechDto(
                "Technology_X",
                "Imported Name (should overwrite curated)",
                "New lore",
                false,
                3,
                "Development",
                List.of(),
                List.of(),
                List.of(),
                List.of(new TechImportUnlockDto(
                        "Constructible",
                        "Improvement",
                        "Improvement_Foundry",
                        List.of(),
                        List.of(),
                        List.of()
                ))
        );

        TechImportBatchDto file = new TechImportBatchDto(
                "Endless Legend 2",
                "0.75",
                "0.1.0",
                "2026-02-10T00:00:00Z",
                "tech",
                List.of(dto)
        );

        // when
        techImportAdminFacade.importTechs(file);
        entityManager.flush();
        entityManager.clear();

        // then
        List<TechEntity> all = techJpaRepository.findAllForCache();
        assertThat(all).hasSize(1);

        TechEntity reloaded = techJpaRepository.findByTechKey("Technology_X").orElseThrow();

        // name SHOULD now be overwritten
        assertThat(reloaded.getName()).isEqualTo("Imported Name (should overwrite curated)");

        // coords SHOULD remain untouched
        assertThat(reloaded.getTechCoords()).isNotNull();
        assertThat(reloaded.getTechCoords().getXPct()).isEqualTo(10.0);
        assertThat(reloaded.getTechCoords().getYPct()).isEqualTo(20.0);

        // baseline fields updated
        assertThat(reloaded.getLore()).isEqualTo("New lore");
        assertThat(reloaded.isHidden()).isFalse();
        assertThat(reloaded.getEra()).isEqualTo(3);
        assertThat(reloaded.getType()).isEqualTo(TechType.ECONOMY);
        assertThat(reloaded.getUnlocks()).hasSize(1);
        assertThat(reloaded.getUnlocks().getFirst().getUnlockType()).isEqualTo("Constructible");
        assertThat(reloaded.getUnlocks().getFirst().getUnlockKey()).isEqualTo("Improvement_Foundry");
        assertThat(reloaded.getUnlocks().getFirst().getUnlockCategory()).isEqualTo("Improvement");
    }

    @Test
    void importTechs_shouldInsertNewTech_withDefaultCoords_0_0_andHiddenNotNull() {

        // given
        assertThat(techJpaRepository.findAllForCache()).isEmpty();

        TechImportTechDto dto = new TechImportTechDto(
                "Technology_NEW",
                "Brand New Tech",
                null,
                false,
                2,
                "Defense",
                List.of(),
                List.of(),
                List.of(),
                List.of()
        );

        TechImportBatchDto file = new TechImportBatchDto(
                "Endless Legend 2",
                "0.75",
                "0.1.0",
                "2026-02-10T00:00:00Z",
                "tech",
                List.of(dto)
        );

        // when
        techImportAdminFacade.importTechs(file);
        entityManager.flush();
        entityManager.clear();

        // then
        TechEntity inserted = techJpaRepository.findByTechKey("Technology_NEW").orElseThrow();

        assertThat(inserted.getName()).isEqualTo("Brand New Tech");
        assertThat(inserted.getEra()).isEqualTo(2);
        assertThat(inserted.getType()).isEqualTo(TechType.DEFENSE);

        assertThat(inserted.getTechCoords()).isNotNull();
        assertThat(inserted.getTechCoords().getXPct()).isEqualTo(0.0);
        assertThat(inserted.getTechCoords().getYPct()).isEqualTo(0.0);

        assertThat(inserted.isHidden()).isNotNull();
        assertThat(inserted.isHidden()).isFalse();
    }

    @Test
    void importTechs_shouldThrow_whenFileIsNull() {

        // given / when / then
        assertThatThrownBy(() -> techImportAdminFacade.importTechs(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Import file is required");
    }

    @Test
    void smokeTestTechs_reportsImportableAndFilteredRows_withoutWritingToDatabase() {
        TechImportTechDto visibleDto = new TechImportTechDto(
                "Technology_VISIBLE",
                "Visible Tech",
                null,
                false,
                1,
                "Discovery",
                List.of(),
                List.of(),
                List.of(),
                List.of()
        );

        TechImportTechDto filteredDto = new TechImportTechDto(
                "Technology_FILTERED",
                "Filtered Tech",
                null,
                false,
                1,
                "Discovery",
                null,
                false,
                false,
                false,
                false,
                false,
                List.of(),
                List.of(),
                List.of(),
                List.of()
        );

        TechImportTechDto invalidDto = new TechImportTechDto(
                "Technology_INVALID",
                "Invalid Tech",
                null,
                false,
                1,
                "Invalid",
                List.of(),
                List.of(),
                List.of(),
                List.of()
        );

        TechImportBatchDto file = new TechImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "2026-06-06T00:00:00Z",
                "tech",
                List.of(visibleDto, filteredDto, invalidDto)
        );

        ImportPreviewSummaryDto summary = techImportAdminFacade.smokeTestTechs(file);

        assertThat(summary.kind()).isEqualTo("tech");
        assertThat(summary.received()).isEqualTo(3);
        assertThat(summary.valid()).isEqualTo(2);
        assertThat(summary.importable()).isEqualTo(1);
        assertThat(summary.filtered()).isEqualTo(1);
        assertThat(summary.failed()).isEqualTo(1);
        assertThat(summary.filters()).anySatisfy(filter -> {
            assertThat(filter.code()).isEqualTo("HIDDEN_OR_NON_PLAYER_FACING_TECH");
            assertThat(filter.count()).isEqualTo(1);
        });
        assertThat(summary.errors()).hasSize(1);
        assertThat(techJpaRepository.findAllForCache()).isEmpty();
    }

    @Test
    void importTechsThroughFacade_persistsRelationshipsAndReadDtoShape() {
        TechImportTechDto root = new TechImportTechDto(
                "Technology_Root",
                "Root Discovery",
                null,
                false,
                1,
                "Discovery",
                List.of(),
                List.of("Technology_Branch"),
                List.of(),
                List.of(new TechImportUnlockDto(
                        "Constructible",
                        "District",
                        "District_Root",
                        List.of(),
                        List.of("+2 Science", "+1 Dust"),
                        List.of()
                ))
        );
        TechImportTechDto branch = new TechImportTechDto(
                "Technology_Branch",
                "Branch Economy",
                "Imported lore",
                false,
                2,
                "Development",
                List.of("Technology_Root"),
                List.of(),
                List.of(),
                List.of()
        );

        techImportAdminFacade.importTechs(new TechImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "2026-06-07T00:00:00Z",
                "tech",
                List.of(root, branch)
        ));
        entityManager.flush();
        entityManager.clear();

        List<TechDto> result = techFacade.getAllTechs();

        assertThat(result).extracting(TechDto::techKey)
                .containsExactlyInAnyOrder("Technology_Root", "Technology_Branch");

        TechDto rootDto = findTech(result, "Technology_Root");
        assertThat(rootDto.name()).isEqualTo("Root Discovery");
        assertThat(rootDto.era()).isEqualTo(1);
        assertThat(rootDto.type()).isEqualTo("Discovery");
        assertThat(rootDto.descriptionLines()).containsExactly("+2 Science", "+1 Dust");
        assertThat(rootDto.prereq()).isNull();
        assertThat(rootDto.excludes()).isEqualTo("Technology_Branch");
        assertThat(rootDto.unlocks()).hasSize(1);
        assertThat(rootDto.unlocks().getFirst().unlockType()).isEqualTo("Constructible");
        assertThat(rootDto.unlocks().getFirst().unlockCategory()).isEqualTo("District");
        assertThat(rootDto.unlocks().getFirst().unlockKey()).isEqualTo("District_Root");
        assertThat(rootDto.unlocks().getFirst().fallbackDescriptionLines()).containsExactly("+2 Science", "+1 Dust");
        assertThat(rootDto.factions()).contains("Aspects", "Kin", "Tahuk");
        assertThat(rootDto.coords().xPct()).isZero();
        assertThat(rootDto.coords().yPct()).isZero();

        TechDto branchDto = findTech(result, "Technology_Branch");
        assertThat(branchDto.type()).isEqualTo("Economy");
        assertThat(branchDto.prereq()).isEqualTo("Technology_Root");
        assertThat(branchDto.excludes()).isNull();
    }

    @Test
    void importTechs_clearsRelationshipsBeforeDeletingObsoleteTechs() {
        techImportAdminFacade.importTechs(new TechImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "2026-06-07T00:00:00Z",
                "tech",
                List.of(
                        new TechImportTechDto(
                                "Technology_A",
                                "Tech A",
                                null,
                                false,
                                1,
                                "Discovery",
                                List.of("Technology_B"),
                                List.of(),
                                List.of(),
                                List.of()
                        ),
                        new TechImportTechDto(
                                "Technology_B",
                                "Tech B",
                                null,
                                false,
                                1,
                                "Discovery",
                                List.of(),
                                List.of("Technology_A"),
                                List.of(),
                                List.of()
                        )
                )
        ));
        entityManager.flush();
        entityManager.clear();

        assertThat(findTech(techFacade.getAllTechs(), "Technology_A").prereq()).isEqualTo("Technology_B");
        assertThat(findTech(techFacade.getAllTechs(), "Technology_B").excludes()).isEqualTo("Technology_A");

        techImportAdminFacade.importTechs(new TechImportBatchDto(
                "Endless Legend 2",
                "0.80",
                "0.1.0",
                "2026-06-07T00:00:00Z",
                "tech",
                List.of(new TechImportTechDto(
                        "Technology_A",
                        "Tech A",
                        null,
                        false,
                        1,
                        "Discovery",
                        List.of(),
                        List.of(),
                        List.of(),
                        List.of()
                ))
        ));
        entityManager.flush();
        entityManager.clear();

        List<TechDto> result = techFacade.getAllTechs();

        assertThat(result).extracting(TechDto::techKey).containsExactly("Technology_A");
        assertThat(result.getFirst().prereq()).isNull();
        assertThat(result.getFirst().excludes()).isNull();
    }

    private static TechDto findTech(List<TechDto> techs, String techKey) {
        return techs.stream()
                .filter(tech -> techKey.equals(tech.techKey()))
                .findFirst()
                .orElseThrow();
    }
}
