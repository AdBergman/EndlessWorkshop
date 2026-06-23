package ewshop.domain.repository;

import ewshop.domain.model.importing.ImportRun;

public interface ImportHistoryRepository {

    void saveImportRun(ImportRun run);
}
