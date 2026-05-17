package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.QuestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface QuestJpaRepository extends JpaRepository<QuestEntity, Long> {

    Optional<QuestEntity> findByQuestKey(String questKey);

    List<QuestEntity> findAllByQuestKeyIn(List<String> questKeys);

    List<QuestEntity> findAllByQuestKeyNotIn(List<String> questKeys);

    @Query("""
        select quest
          from QuestEntity quest
         order by quest.questKey asc
    """)
    List<QuestEntity> findAllForQuestExplorer();
}
