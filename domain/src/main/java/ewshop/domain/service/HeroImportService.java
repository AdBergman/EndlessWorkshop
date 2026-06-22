package ewshop.domain.service;

import ewshop.domain.command.HeroImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.HeroRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class HeroImportService {

    private final HeroRepository heroRepository;

    public HeroImportService(HeroRepository heroRepository) {
        this.heroRepository = heroRepository;
    }

    @Transactional
    @CacheEvict(value = "heroes", allEntries = true)
    public ImportResult importHeroes(List<HeroImportSnapshot> snapshots) {
        if (snapshots == null || snapshots.isEmpty()) {
            return new ImportResult();
        }
        return heroRepository.importHeroSnapshot(snapshots);
    }
}
