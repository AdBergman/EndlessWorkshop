package ewshop.domain.service;

import ewshop.domain.model.Unit;
import ewshop.domain.repository.UnitRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UnitService {

    private final UnitRepository unitRepository;

    public UnitService(UnitRepository unitRepository) {
        this.unitRepository = unitRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable("units")
    public List<Unit> getAllUnits() {
        return unitRepository.findAll();
    }

    @Transactional
    @CacheEvict(value = "units", allEntries = true)
    public Unit save(Unit unit) {
        return unitRepository.save(unit);
    }

    @Transactional
    @CacheEvict(value = "units", allEntries = true)
    public void saveAll(List<Unit> units) {
        unitRepository.saveAll(units);
    }
}