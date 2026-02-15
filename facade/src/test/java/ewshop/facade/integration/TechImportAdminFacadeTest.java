package ewshop.facade.integration;

import ewshop.domain.model.TechCoords;
import ewshop.domain.model.enums.TechType;
import ewshop.facade.dto.importing.tech.TechImportBatchDto;
import ewshop.facade.dto.importing.tech.TechImportTechDto;
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
    void importTechs_shouldNotOverwriteNameOrCoords_whenTechAlreadyExists_butShouldUpdateBaselineFields() {

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
                "Imported Name (should NOT overwrite curated)",
                "New lore",
                false,
                3,
                "Development",
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
        List<TechEntity> all = techJpaRepository.findAll();
        assertThat(all).hasSize(1);

        TechEntity reloaded = techJpaRepository.findByTechKey("Technology_X").orElseThrow();

        assertThat(reloaded.getName()).isEqualTo("Curated Name");
        assertThat(reloaded.getTechCoords()).isNotNull();
        assertThat(reloaded.getTechCoords().getXPct()).isEqualTo(10.0);
        assertThat(reloaded.getTechCoords().getYPct()).isEqualTo(20.0);

        assertThat(reloaded.getLore()).isEqualTo("New lore");
        assertThat(reloaded.isHidden()).isFalse();
        assertThat(reloaded.getEra()).isEqualTo(3);
        assertThat(reloaded.getType()).isEqualTo(TechType.ECONOMY);
    }

    @Test
    void importTechs_shouldInsertNewTech_withDefaultCoords_0_0_andHiddenNotNull() {

        // given
        assertThat(techJpaRepository.findAll()).isEmpty();

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
}