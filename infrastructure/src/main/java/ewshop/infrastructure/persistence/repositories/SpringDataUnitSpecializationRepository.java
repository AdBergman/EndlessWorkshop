package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.UnitSpecializationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpringDataUnitSpecializationRepository extends JpaRepository<UnitSpecializationEntity, Long> {
    Optional<UnitSpecializationEntity> findByName(String name);
}
