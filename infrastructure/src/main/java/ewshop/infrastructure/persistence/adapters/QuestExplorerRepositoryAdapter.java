package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.command.QuestExplorerEntryImportSnapshot;
import ewshop.domain.command.QuestExplorerImportMetadata;
import ewshop.domain.model.quest.QuestExplorer;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.QuestExplorerRepository;
import ewshop.infrastructure.persistence.entities.QuestExplorerEntryEntity;
import ewshop.infrastructure.persistence.entities.QuestExplorerImportMetadataEntity;
import ewshop.infrastructure.persistence.mappers.QuestExplorerPersistenceMapper;
import ewshop.infrastructure.persistence.repositories.QuestExplorerEntryJpaRepository;
import ewshop.infrastructure.persistence.repositories.QuestExplorerImportMetadataJpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Repository
public class QuestExplorerRepositoryAdapter implements QuestExplorerRepository {

    private static final long METADATA_ID = 1L;

    private final QuestExplorerEntryJpaRepository entryRepository;
    private final QuestExplorerImportMetadataJpaRepository metadataRepository;
    private final QuestExplorerPersistenceMapper mapper;

    public QuestExplorerRepositoryAdapter(
            QuestExplorerEntryJpaRepository entryRepository,
            QuestExplorerImportMetadataJpaRepository metadataRepository,
            QuestExplorerPersistenceMapper mapper
    ) {
        this.entryRepository = entryRepository;
        this.metadataRepository = metadataRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public ImportResult importQuestExplorerEntries(
            QuestExplorerImportMetadata metadata,
            List<QuestExplorerEntryImportSnapshot> snapshots
    ) {
        ImportResult result = new ImportResult();
        if (snapshots == null || snapshots.isEmpty()) return result;

        List<String> keepKeys = snapshots.stream()
                .map(QuestExplorerEntryImportSnapshot::entryKey)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(key -> !key.isBlank())
                .distinct()
                .toList();

        if (keepKeys.isEmpty()) {
            throw new IllegalStateException("Refusing to delete all quest explorer entries: keepKeys empty.");
        }

        Map<String, QuestExplorerEntryEntity> existingByKey = entryRepository.findAllByEntryKeyIn(keepKeys).stream()
                .collect(Collectors.toMap(entity -> entity.entryKey, Function.identity()));

        List<QuestExplorerEntryEntity> toSave = new ArrayList<>();
        for (QuestExplorerEntryImportSnapshot snapshot : snapshots) {
            QuestExplorerEntryEntity entity = existingByKey.get(snapshot.entryKey());
            boolean isInsert = entity == null;
            if (isInsert) {
                entity = new QuestExplorerEntryEntity();
                result.incrementInserted();
                mapper.applySnapshot(entity, snapshot);
                toSave.add(entity);
            } else if (mapper.isUnchanged(entity, snapshot)) {
                result.incrementUnchanged();
            } else {
                result.incrementUpdated();
                mapper.applySnapshot(entity, snapshot);
                toSave.add(entity);
            }
        }

        saveMetadata(metadata);
        if (!toSave.isEmpty()) {
            entryRepository.saveAll(toSave);
        }

        List<QuestExplorerEntryEntity> obsolete = entryRepository.findAllByEntryKeyNotIn(keepKeys);
        if (!obsolete.isEmpty()) {
            entryRepository.deleteAll(obsolete);
            result.setDeleted(obsolete.size());
        }

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public QuestExplorer findQuestExplorer() {
        QuestExplorerImportMetadataEntity metadata = metadataRepository.findById(METADATA_ID).orElse(null);
        List<QuestExplorerEntryEntity> entries = entryRepository.findAllByOrderByNavigationSequenceIndexAscIdAsc();
        return mapper.toModel(metadata, entries);
    }

    private void saveMetadata(QuestExplorerImportMetadata metadata) {
        QuestExplorerImportMetadataEntity entity = metadataRepository.findById(METADATA_ID)
                .orElseGet(QuestExplorerImportMetadataEntity::new);
        mapper.applyMetadata(entity, metadata, METADATA_ID);
        metadataRepository.save(entity);
    }
}
