package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.ImprovementEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImprovementJpaRepository extends JpaRepository<ImprovementEntity, Long> {

    List<ImprovementEntity> findAllByConstructibleKeyIn(List<String> keys);

    List<ImprovementEntity> findAllByConstructibleKeyNotIn(List<String> keepKeys);
}