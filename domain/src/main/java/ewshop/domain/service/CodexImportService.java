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

    private final CodexRepository codexRepository;

    public CodexImportService(CodexRepository codexRepository) {
        this.codexRepository = codexRepository;
    }

    @Transactional
    @CacheEvict(value = "codex", allEntries = true)
    public ImportResult importCodex(List<CodexImportSnapshot> snapshots) {
        if (snapshots == null || snapshots.isEmpty()) return new ImportResult();
        return codexRepository.importCodexSnapshot(snapshots);
    }
}