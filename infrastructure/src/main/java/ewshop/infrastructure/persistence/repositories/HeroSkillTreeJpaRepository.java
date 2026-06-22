package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.HeroSkillTreeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HeroSkillTreeJpaRepository extends JpaRepository<HeroSkillTreeEntity, Long> {
    List<HeroSkillTreeEntity> findAllByTreeKeyIn(List<String> keys);
    List<HeroSkillTreeEntity> findAllByTreeKeyNotIn(List<String> keepKeys);
}
