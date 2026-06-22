package ewshop.domain.repository;

import ewshop.domain.command.FactionImportSnapshot;
import ewshop.domain.model.Faction;
import ewshop.domain.model.results.ImportResult;

import java.util.List;

public interface FactionRepository {
    List<Faction> findAll();
    ImportResult importFactionSnapshot(List<FactionImportSnapshot> snapshots);
}
