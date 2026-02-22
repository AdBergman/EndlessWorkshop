package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.UnitSpecializationEntityLegacy;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnitSpecializationJpaRepositoryLegacy extends JpaRepository<UnitSpecializationEntityLegacy, Long> {
    Optional<UnitSpecializationEntityLegacy> findByName(String name);

    @EntityGraph(attributePaths = {
            "unitSkills",
            "unitSkills.skill",
            "costs"
    })
    List<UnitSpecializationEntityLegacy> findAll();
}