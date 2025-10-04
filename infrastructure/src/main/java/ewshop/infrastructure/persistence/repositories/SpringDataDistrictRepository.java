package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.DistrictEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpringDataDistrictRepository extends JpaRepository<DistrictEntity, Long> {
    Optional<DistrictEntity> findByName(String name);
}
