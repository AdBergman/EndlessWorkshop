package ewshop.domain.repository;

import ewshop.domain.command.DistrictImportSnapshot;
import ewshop.domain.model.District;
import ewshop.domain.model.results.ImportResult;

import java.util.List;

public interface DistrictRepository {

    List<District> findAll();

    ImportResult importDistrictSnapshot(List<DistrictImportSnapshot> snapshots);
}