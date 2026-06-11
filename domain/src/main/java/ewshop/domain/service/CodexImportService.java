package ewshop.domain.service;

import ewshop.domain.command.CodexImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.CodexRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
public class CodexImportService {

    private static final String ACTIONS_EXPORT_KIND = "actions";
    private static final String BONUSES_EXPORT_KIND = "bonuses";
    private static final String QUESTS_EXPORT_KIND = "quests";
    private static final String TRAITS_EXPORT_KIND = "traits";

    private final CodexRepository codexRepository;

    public CodexImportService(CodexRepository codexRepository) {
        this.codexRepository = codexRepository;
    }

    @Transactional
    @CacheEvict(value = "codex", allEntries = true)
    public ImportResult importCodex(List<CodexImportSnapshot> snapshots) {
        if (snapshots == null || snapshots.isEmpty()) return new ImportResult();
        List<CodexImportSnapshot> importableSnapshots = snapshots.stream()
                .filter(Objects::nonNull)
                .filter(CodexImportService::isImportableCodexSnapshot)
                .map(CodexImportService::cleanHiddenRelationshipKeys)
                .toList();
        return codexRepository.importCodexSnapshot(importableSnapshots);
    }

    private static boolean isImportableCodexSnapshot(CodexImportSnapshot snapshot) {
        String exportKind = trimToEmpty(snapshot.exportKind());
        if (ACTIONS_EXPORT_KIND.equalsIgnoreCase(exportKind)) {
            return PublicReleaseFactionPolicy.isReleasedActionKey(snapshot.entryKey());
        }
        if (BONUSES_EXPORT_KIND.equalsIgnoreCase(exportKind)) {
            return PublicReleaseFactionPolicy.isReleasedBonusKey(snapshot.entryKey());
        }
        if (QUESTS_EXPORT_KIND.equalsIgnoreCase(exportKind)) {
            return PublicReleaseFactionPolicy.isReleasedFactionQuestKey(snapshot.entryKey());
        }
        if (TRAITS_EXPORT_KIND.equalsIgnoreCase(exportKind)) {
            return PublicReleaseFactionPolicy.isReleasedFactionTraitKey(snapshot.entryKey());
        }
        return true;
    }

    private static CodexImportSnapshot cleanHiddenRelationshipKeys(CodexImportSnapshot snapshot) {
        return new CodexImportSnapshot(
                snapshot.entryKey(),
                snapshot.displayName(),
                snapshot.exportKind(),
                snapshot.category(),
                snapshot.kind(),
                snapshot.descriptionLines(),
                cleanPublicRelationshipKeys(snapshot.referenceKeys()),
                snapshot.facts(),
                snapshot.sections(),
                cleanPublicRelationshipKeys(snapshot.publicContextKeys())
        );
    }

    private static List<String> cleanPublicRelationshipKeys(List<String> keys) {
        if (keys == null || keys.isEmpty()) return List.of();

        return keys.stream()
                .filter(PublicReleaseFactionPolicy::isPublicCodexRelationshipKey)
                .toList();
    }

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }
}
