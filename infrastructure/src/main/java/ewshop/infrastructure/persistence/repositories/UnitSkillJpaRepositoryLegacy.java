package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.UnitSkillEntityLegacy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UnitSkillJpaRepositoryLegacy extends JpaRepository<UnitSkillEntityLegacy, Long> {
    Optional<UnitSkillEntityLegacy> findByName(String name);

    boolean existsByName(String name);
}
