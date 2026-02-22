package ewshop.domain.service;

import ewshop.domain.command.UnitImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.UnitRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UnitImportService {

    private final UnitRepository unitRepository;

    public UnitImportService(UnitRepository unitRepository) {
        this.unitRepository = unitRepository;
    }

    @Transactional
    @CacheEvict(value = "units", allEntries = true)
    public ImportResult importUnits(List<UnitImportSnapshot> snapshots) {
        if (snapshots == null || snapshots.isEmpty()) {
            return new ImportResult();
        }

        return unitRepository.importUnitSnapshot(snapshots);
    }
}