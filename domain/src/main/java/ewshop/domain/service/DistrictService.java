package ewshop.domain.service;

import ewshop.domain.model.District;
import ewshop.domain.repository.DistrictRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DistrictService {

    private final DistrictRepository districtRepository;

    public DistrictService(DistrictRepository districtRepository) {
        this.districtRepository = districtRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable("districts")
    public List<District> getAllDistricts() {
        return districtRepository.findAll();
    }
}
