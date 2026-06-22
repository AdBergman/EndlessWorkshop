package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.FactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FactionJpaRepository extends JpaRepository<FactionEntity, Long> {
    List<FactionEntity> findAllByFactionKeyIn(List<String> keys);
    List<FactionEntity> findAllByFactionKeyNotIn(List<String> keepKeys);
}
