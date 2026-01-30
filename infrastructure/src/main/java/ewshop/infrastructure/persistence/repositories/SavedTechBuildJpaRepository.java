package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.SavedTechBuildEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedTechBuildJpaRepository extends JpaRepository<SavedTechBuildEntity, Long> {
    Optional<SavedTechBuildEntity> findByUuid(UUID uuid);
}
