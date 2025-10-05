package ewshop.domain.repository;

import ewshop.domain.entity.District;

import java.util.List;

public interface DistrictRepository {

    District save(District district);

    List<District> findAll();

    void deleteAll();
}
