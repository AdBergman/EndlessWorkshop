package ewshop.domain.repository;

import ewshop.domain.model.importing.ImportRun;

import java.util.Optional;

public interface ImportHistoryRepository {

    void saveImportRun(ImportRun run);

    Optional<ImportRun> findLatestSuccessfulImportRun();

    Optional<ImportRun> findLatestSuccessfulImportRunByImportedKind(String importKind);

    Optional<ImportRun> findLatestImportRun();
}
