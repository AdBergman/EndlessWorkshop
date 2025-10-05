package ewshop.domain.service;

import ewshop.domain.entity.District;
import ewshop.domain.repository.DistrictRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DistrictService {

    private final DistrictRepository districtRepository;

    public DistrictService(DistrictRepository districtRepository) {
        this.districtRepository = districtRepository;
    }

    /**
     * Returns all District domain entities.
     */
    public List<District> getAllDistricts() {
        return districtRepository.findAll();
    }
}
