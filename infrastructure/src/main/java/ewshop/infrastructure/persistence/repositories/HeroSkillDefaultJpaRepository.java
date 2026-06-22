package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.HeroSkillDefaultEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HeroSkillDefaultJpaRepository extends JpaRepository<HeroSkillDefaultEntity, Long> {
    List<HeroSkillDefaultEntity> findAllByHeroKeyIn(List<String> keys);
    List<HeroSkillDefaultEntity> findAllByHeroKeyNotIn(List<String> keepKeys);
}
