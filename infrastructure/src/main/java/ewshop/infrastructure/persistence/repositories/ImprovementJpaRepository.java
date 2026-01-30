package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.ImprovementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ImprovementJpaRepository extends JpaRepository<ImprovementEntity, Long> {
    Optional<ImprovementEntity> findByName(String name);
}
