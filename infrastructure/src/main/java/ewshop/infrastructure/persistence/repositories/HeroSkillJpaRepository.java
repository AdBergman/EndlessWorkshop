package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.HeroSkillEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HeroSkillJpaRepository extends JpaRepository<HeroSkillEntity, Long> {
    List<HeroSkillEntity> findAllBySkillKeyIn(List<String> keys);
    List<HeroSkillEntity> findAllBySkillKeyNotIn(List<String> keepKeys);
}
