package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.RichHeroEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RichHeroJpaRepository extends JpaRepository<RichHeroEntity, Long> {
    List<RichHeroEntity> findAllByUnitKeyIn(List<String> keys);
    List<RichHeroEntity> findAllByUnitKeyNotIn(List<String> keepKeys);
}
