package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.DistrictEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DistrictJpaRepository extends JpaRepository<DistrictEntity, Long> {
    Optional<DistrictEntity> findByName(String name);
}
