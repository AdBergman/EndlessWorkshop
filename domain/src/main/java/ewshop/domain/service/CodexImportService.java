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
        return PublicContentPolicy.isPublicKey(snapshot.entryKey())
                && PublicContentPolicy.isPublicDisplayName(snapshot.displayName());
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
                cleanPublicRelationshipKeys(snapshot.publicContextKeys()),
                snapshot.svgIcon()
        );
    }

    private static List<String> cleanPublicRelationshipKeys(List<String> keys) {
        if (keys == null || keys.isEmpty()) return List.of();

        return keys.stream()
                .filter(PublicContentPolicy::isPublicKey)
                .toList();
    }

}
