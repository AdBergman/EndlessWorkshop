package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.CodexEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CodexJpaRepository extends JpaRepository<CodexEntity, Long> {

    List<CodexEntity> findAllByExportKindAndEntryKeyIn(String exportKind, List<String> entryKeys);

    List<CodexEntity> findAllByExportKindAndEntryKeyNotIn(String exportKind, List<String> entryKeys);
}