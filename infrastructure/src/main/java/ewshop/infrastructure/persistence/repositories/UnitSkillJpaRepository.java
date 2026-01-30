package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.UnitSkillEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UnitSkillJpaRepository extends JpaRepository<UnitSkillEntity, Long> {
    Optional<UnitSkillEntity> findByName(String name);

    boolean existsByName(String name);
}
