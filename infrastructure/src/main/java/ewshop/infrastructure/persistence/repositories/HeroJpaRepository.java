package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.HeroEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HeroJpaRepository extends JpaRepository<HeroEntity, Long> {
    List<HeroEntity> findAllByUnitKeyIn(List<String> keys);
    List<HeroEntity> findAllByUnitKeyNotIn(List<String> keepKeys);
}
