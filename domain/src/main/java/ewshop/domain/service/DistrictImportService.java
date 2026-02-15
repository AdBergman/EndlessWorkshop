package ewshop.domain.service;

import ewshop.domain.command.DistrictImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.DistrictRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DistrictImportService {

    private final DistrictRepository districtRepository;

    public DistrictImportService(DistrictRepository districtRepository) {
        this.districtRepository = districtRepository;
    }

    public ImportResult importDistricts(List<DistrictImportSnapshot> snapshots) {
        if (snapshots == null || snapshots.isEmpty()) return new ImportResult();
        return districtRepository.importDistrictSnapshot(snapshots);
    }
}