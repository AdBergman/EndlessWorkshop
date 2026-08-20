package ewshop.domain.repository;

import ewshop.domain.command.CodexImportSnapshot;
import ewshop.domain.model.Codex;
import ewshop.domain.model.results.ImportResult;

import java.util.List;

public interface CodexRepository {

    List<Codex> findAll();

    List<Codex> findAllByExportKind(String exportKind);

    ImportResult importCodexSnapshot(List<CodexImportSnapshot> snapshots);
}
