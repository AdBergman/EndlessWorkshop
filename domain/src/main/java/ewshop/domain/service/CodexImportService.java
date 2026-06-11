package ewshop.domain.service;

import ewshop.domain.command.CodexImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.CodexRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CodexImportService {

    private static final String ACTIONS_EXPORT_KIND = "actions";

    private final CodexRepository codexRepository;

    public CodexImportService(CodexRepository codexRepository) {
        this.codexRepository = codexRepository;
    }

    @Transactional
    @CacheEvict(value = "codex", allEntries = true)
    public ImportResult importCodex(List<CodexImportSnapshot> snapshots) {
        if (snapshots == null || snapshots.isEmpty()) return new ImportResult();
        List<CodexImportSnapshot> importableSnapshots = snapshots.stream()
                .filter(CodexImportService::isImportableCodexSnapshot)
                .toList();
        return codexRepository.importCodexSnapshot(importableSnapshots);
    }

    private static boolean isImportableCodexSnapshot(CodexImportSnapshot snapshot) {
        if (snapshot == null) return false;
        if (!ACTIONS_EXPORT_KIND.equalsIgnoreCase(trimToEmpty(snapshot.exportKind()))) return true;
        return PublicReleaseFactionPolicy.isReleasedFactionActionKey(snapshot.entryKey());
    }

    private static String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }
}
