package ewshop.domain.repository;

import ewshop.domain.command.UnitImportSnapshot;
import ewshop.domain.model.Unit;
import ewshop.domain.model.results.ImportResult;

import java.util.List;

public interface UnitRepository {
    List<Unit> findAll();
    Unit save(Unit unit);
    void saveAll(List<Unit> units);
    ImportResult importUnitSnapshot(List<UnitImportSnapshot> snapshots);
}