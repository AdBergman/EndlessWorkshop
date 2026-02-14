package ewshop.domain.service;

import ewshop.domain.command.TechPlacementUpdate;
import ewshop.domain.model.Tech;
import ewshop.domain.repository.TechRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TechService {

    private final TechRepository techRepository;

    public TechService(TechRepository techRepository) {
        this.techRepository = techRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable("techs")
    public List<Tech> getAllTechs() {
        return techRepository.findAll();
    }

    @Transactional
    @CacheEvict(value = "techs", allEntries = true)
    public Tech save(Tech tech) {
        return techRepository.save(tech);
    }

    @Transactional
    @CacheEvict(value = "techs", allEntries = true)
    public void saveAll(List<Tech> techs) {
        techRepository.saveAll(techs);
    }

    @Transactional
    @CacheEvict(value = "techs", allEntries = true)
    public void applyPlacementUpdates(List<TechPlacementUpdate> updates) {
        if (updates == null || updates.isEmpty()) return;

        for (TechPlacementUpdate techPlacementUpdate : updates) {
            techRepository.updateEraAndCoordsByTechKey(techPlacementUpdate);
        }
    }
}
