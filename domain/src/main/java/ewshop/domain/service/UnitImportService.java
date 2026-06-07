package ewshop.domain.service;

import ewshop.domain.command.UnitImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.model.results.UnitImportPreview;
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
        UnitImportPreview preview = previewUnits(snapshots);

        if (preview.importableSnapshots().isEmpty()) {
            if (snapshots != null && !snapshots.isEmpty()) {
                throw new IllegalStateException("Unit import produced 0 public units; refusing to write/delete.");
            }
            return new ImportResult();
        }

        return unitRepository.importUnitSnapshot(preview.importableSnapshots());
    }

    public UnitImportPreview previewUnits(List<UnitImportSnapshot> snapshots) {
        if (snapshots == null || snapshots.isEmpty()) {
            return new UnitImportPreview(List.of(), 0, 0);
        }

        List<UnitImportSnapshot> nonNullSnapshots = snapshots.stream()
                .filter(snapshot -> snapshot != null)
                .toList();

        int rowsWithoutFaction = (int) nonNullSnapshots.stream()
                .filter(UnitImportPolicy::isMissingAllowedFaction)
                .count();

        int prototypeClassRows = (int) nonNullSnapshots.stream()
                .filter(UnitImportPolicy::isPrototypeUnitClass)
                .count();

        List<UnitImportSnapshot> allowed = nonNullSnapshots.stream()
                .filter(UnitImportPolicy::isImportable)
                .toList();

        return new UnitImportPreview(allowed, rowsWithoutFaction, prototypeClassRows);
    }
}
