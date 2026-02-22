package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.UnitEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UnitJpaRepository extends JpaRepository<UnitEntity, Long> {

    Optional<UnitEntity> findByUnitKey(String unitKey);

    List<UnitEntity> findAllByUnitKeyIn(List<String> keys);

    List<UnitEntity> findAllByUnitKeyNotIn(List<String> keepKeys);
}