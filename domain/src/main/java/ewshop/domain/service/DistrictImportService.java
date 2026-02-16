package ewshop.domain.service;

import ewshop.domain.command.DistrictImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.DistrictRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DistrictImportService {

    private final DistrictRepository districtRepository;

    public DistrictImportService(DistrictRepository districtRepository) {
        this.districtRepository = districtRepository;
    }

    @Transactional
    @CacheEvict(value = "districts", allEntries = true)
    public ImportResult importDistricts(List<DistrictImportSnapshot> snapshots) {
        if (snapshots == null || snapshots.isEmpty()) return new ImportResult();
        return districtRepository.importDistrictSnapshot(snapshots);
    }
}