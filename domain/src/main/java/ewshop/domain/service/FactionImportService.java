package ewshop.domain.service;

import ewshop.domain.command.FactionImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.FactionRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FactionImportService {

    private final FactionRepository factionRepository;

    public FactionImportService(FactionRepository factionRepository) {
        this.factionRepository = factionRepository;
    }

    @Transactional
    @CacheEvict(value = "factions", allEntries = true)
    public ImportResult importFactions(List<FactionImportSnapshot> snapshots) {
        if (snapshots == null || snapshots.isEmpty()) {
            return new ImportResult();
        }

        return factionRepository.importFactionSnapshot(snapshots);
    }
}
