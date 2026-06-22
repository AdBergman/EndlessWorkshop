package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.HeroSkillTierEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HeroSkillTierJpaRepository extends JpaRepository<HeroSkillTierEntity, Long> {
    List<HeroSkillTierEntity> findAllByTierPlacementKeyIn(List<String> keys);
    List<HeroSkillTierEntity> findAllByTierPlacementKeyNotIn(List<String> keepKeys);
}
