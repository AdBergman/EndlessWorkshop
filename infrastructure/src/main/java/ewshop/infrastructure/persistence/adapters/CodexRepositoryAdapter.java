package ewshop.infrastructure.persistence.adapters;

import ewshop.domain.command.CodexImportSnapshot;
import ewshop.domain.model.Codex;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.CodexRepository;
import ewshop.infrastructure.persistence.entities.CodexEntity;
import ewshop.infrastructure.persistence.mappers.CodexMapper;
import ewshop.infrastructure.persistence.mappers.CodexMetadataJsonMapper;
import ewshop.infrastructure.persistence.repositories.CodexJpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Repository
public class CodexRepositoryAdapter implements CodexRepository {

    private final CodexJpaRepository codexJpaRepository;
    private final CodexMapper codexMapper;

    public CodexRepositoryAdapter(CodexJpaRepository codexJpaRepository, CodexMapper codexMapper) {
        this.codexJpaRepository = codexJpaRepository;
        this.codexMapper = codexMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Codex> findAll() {
        return codexJpaRepository.findAll().stream()
                .map(codexMapper::toDomain)
                .toList();
    }

    private enum UpsertOutcome { INSERTED, UPDATED, UNCHANGED }

    @Override
    @Transactional
    public ImportResult importCodexSnapshot(List<CodexImportSnapshot> snapshots) {
        ImportResult result = new ImportResult();
        if (snapshots == null || snapshots.isEmpty()) return result;

        Map<String, List<CodexImportSnapshot>> byKind = snapshots.stream()
                .filter(Objects::nonNull)
                .filter(s -> s.exportKind() != null && !s.exportKind().isBlank())
                .collect(Collectors.groupingBy(s -> s.exportKind().trim()));

        if (byKind.isEmpty()) {
            throw new IllegalStateException("Refusing to import codex: no exportKind present in snapshots.");
        }

        for (Map.Entry<String, List<CodexImportSnapshot>> e : byKind.entrySet()) {
            String kind = e.getKey();
            List<CodexImportSnapshot> kindSnapshots = e.getValue();

            List<String> keepKeys = kindSnapshots.stream()
                    .map(CodexImportSnapshot::entryKey)
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .distinct()
                    .toList();

            if (keepKeys.isEmpty()) {
                throw new IllegalStateException("Refusing to delete all codex rows for kind='" + kind + "': keepKeys empty.");
            }

            Map<String, CodexEntity> existingByKey =
                    codexJpaRepository.findAllByExportKindAndEntryKeyIn(kind, keepKeys).stream()
                            .collect(Collectors.toMap(CodexEntity::getEntryKey, Function.identity()));

            List<CodexEntity> toSave = new ArrayList<>();

            for (CodexImportSnapshot snapshot : kindSnapshots) {
                if (snapshot == null) continue;

                String entryKey = snapshot.entryKey();
                if (entryKey == null || entryKey.isBlank()) continue;

                String normalizedKey = entryKey.trim();
                CodexEntity entity = existingByKey.get(normalizedKey);
                boolean isInsert = (entity == null);

                if (isInsert) {
                    entity = new CodexEntity();
                    entity.setExportKind(kind);
                    entity.setEntryKey(normalizedKey);
                }

                UpsertOutcome outcome = applySnapshot(entity, snapshot, isInsert);

                switch (outcome) {
                    case INSERTED -> { toSave.add(entity); result.incrementInserted(); }
                    case UPDATED  -> { toSave.add(entity); result.incrementUpdated(); }
                    case UNCHANGED -> result.incrementUnchanged();
                }
            }

            if (!toSave.isEmpty()) {
                codexJpaRepository.saveAll(toSave);
            }

            List<CodexEntity> obsolete = codexJpaRepository.findAllByExportKindAndEntryKeyNotIn(kind, keepKeys);
            if (!obsolete.isEmpty()) {
                codexJpaRepository.deleteAll(obsolete);
                result.setDeleted(result.getDeleted() + obsolete.size());
            }
        }

        return result;
    }

    private static UpsertOutcome applySnapshot(CodexEntity entity, CodexImportSnapshot update, boolean isInsert) {
        boolean changed = isInsert;

        if (!Objects.equals(entity.getDisplayName(), update.displayName())) {
            entity.setDisplayName(update.displayName());
            changed = true;
        }

        if (!Objects.equals(entity.getCategory(), update.category())) {
            entity.setCategory(update.category());
            changed = true;
        }

        if (!Objects.equals(entity.getKind(), update.kind())) {
            entity.setKind(update.kind());
            changed = true;
        }

        String newSvgIconSource = update.svgIcon() == null ? null : update.svgIcon().source();
        if (!Objects.equals(entity.getSvgIconSource(), newSvgIconSource)) {
            entity.setSvgIconSource(newSvgIconSource);
            changed = true;
        }

        String newSvgIconKey = update.svgIcon() == null ? null : update.svgIcon().key();
        if (!Objects.equals(entity.getSvgIconKey(), newSvgIconKey)) {
            entity.setSvgIconKey(newSvgIconKey);
            changed = true;
        }

        List<String> newLines = update.descriptionLines() == null ? List.of() : new ArrayList<>(update.descriptionLines());
        if (!Objects.equals(entity.getDescriptionLines(), newLines)) {
            entity.setDescriptionLines(newLines);
            changed = true;
        }

        List<String> newRefs = normalizeKeys(update.referenceKeys());
        if (!Objects.equals(entity.getReferenceKeys(), newRefs)) {
            entity.setReferenceKeys(newRefs);
            changed = true;
        }

        String newFactsJson = CodexMetadataJsonMapper.encodeFacts(update.facts());
        if (!Objects.equals(entity.getFactsJson(), newFactsJson)) {
            entity.setFactsJson(newFactsJson);
            changed = true;
        }

        String newSectionsJson = CodexMetadataJsonMapper.encodeSections(update.sections());
        if (!Objects.equals(entity.getSectionsJson(), newSectionsJson)) {
            entity.setSectionsJson(newSectionsJson);
            changed = true;
        }

        List<String> newPublicContextKeys = normalizeKeys(update.publicContextKeys());
        if (!Objects.equals(entity.getPublicContextKeys(), newPublicContextKeys)) {
            entity.setPublicContextKeys(newPublicContextKeys);
            changed = true;
        }

        if (isInsert) return UpsertOutcome.INSERTED;
        return changed ? UpsertOutcome.UPDATED : UpsertOutcome.UNCHANGED;
    }

    private static List<String> normalizeKeys(List<String> keys) {
        if (keys == null || keys.isEmpty()) return List.of();
        return keys.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
    }
}
