package ewshop.infrastructure.persistence.repository;

import ewshop.infrastructure.persistence.entities.ImprovementEntity;
import ewshop.infrastructure.persistence.repositories.ImprovementJpaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ImprovementIT {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ImprovementJpaRepository repository;

    @Test
    void shouldPersistAndLoadImprovement_WithDescriptionLinesInOrder() {
        // Arrange
        ImprovementEntity e = new ImprovementEntity();
        e.setConstructibleKey("DistrictImprovement_Test_01");
        e.setDisplayName("Crystal Forge");
        e.setCategory("Industry");
        e.setDescriptionLines(List.of("Line 1", "Line 2", "Line 3"));

        entityManager.persistAndFlush(e);
        entityManager.clear();

        // Act
        List<ImprovementEntity> all = repository.findAll();

        // Assert
        assertThat(all).hasSize(1);

        ImprovementEntity loaded = all.get(0);
        assertThat(loaded.getConstructibleKey()).isEqualTo("DistrictImprovement_Test_01");
        assertThat(loaded.getDisplayName()).isEqualTo("Crystal Forge");
        assertThat(loaded.getCategory()).isEqualTo("Industry");

        // Order matters because we use @OrderColumn(line_index)
        assertThat(loaded.getDescriptionLines()).containsExactly("Line 1", "Line 2", "Line 3");
    }

    @Test
    void findAllByConstructibleKeyIn_and_NotIn_shouldWork() {
        // Arrange
        ImprovementEntity a = new ImprovementEntity();
        a.setConstructibleKey("Imp_A");
        a.setDisplayName("A");
        a.setCategory(null);
        a.setDescriptionLines(List.of("A1"));

        ImprovementEntity b = new ImprovementEntity();
        b.setConstructibleKey("Imp_B");
        b.setDisplayName("B");
        b.setCategory(null);
        b.setDescriptionLines(List.of("B1"));

        entityManager.persist(a);
        entityManager.persistAndFlush(b);
        entityManager.clear();

        // Act
        var in = repository.findAllByConstructibleKeyIn(List.of("Imp_A"));
        var notIn = repository.findAllByConstructibleKeyNotIn(List.of("Imp_A"));

        // Assert
        assertThat(in).hasSize(1);
        assertThat(in.get(0).getConstructibleKey()).isEqualTo("Imp_A");

        assertThat(notIn).hasSize(1);
        assertThat(notIn.get(0).getConstructibleKey()).isEqualTo("Imp_B");
    }
}