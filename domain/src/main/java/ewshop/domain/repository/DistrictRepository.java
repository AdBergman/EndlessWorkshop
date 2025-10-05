package ewshop.domain.repository;

import ewshop.domain.entity.District;

import java.util.List;

public interface DistrictRepository {

    District save(District district);

    void saveAll(List<District> districts);

    District findByName(String name);

    List<District> findAll();

    void deleteAll();
}
