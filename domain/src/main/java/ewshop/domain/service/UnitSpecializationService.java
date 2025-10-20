package ewshop.domain.service;

import ewshop.domain.entity.UnitSpecialization;
import ewshop.domain.repository.UnitSpecializationRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UnitSpecializationService {

    private final UnitSpecializationRepository unitRepository;

    public UnitSpecializationService(UnitSpecializationRepository unitRepository) {
        this.unitRepository = unitRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable("units")  // key can be "units" for all, or you can have separate caches if needed
    public List<UnitSpecialization> getAllUnits() {
        return unitRepository.findAll();
    }

}
