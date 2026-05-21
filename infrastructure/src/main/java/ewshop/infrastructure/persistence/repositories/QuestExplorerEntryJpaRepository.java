package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.QuestExplorerEntryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestExplorerEntryJpaRepository extends JpaRepository<QuestExplorerEntryEntity, Long> {

    List<QuestExplorerEntryEntity> findAllByOrderByNavigationSequenceIndexAscIdAsc();

    List<QuestExplorerEntryEntity> findAllByEntryKeyIn(List<String> entryKeys);

    List<QuestExplorerEntryEntity> findAllByEntryKeyNotIn(List<String> entryKeys);
}
