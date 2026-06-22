package ewshop.domain.service;

import ewshop.domain.command.RichHeroImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.RichHeroRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RichHeroImportService {

    private final RichHeroRepository richHeroRepository;

    public RichHeroImportService(RichHeroRepository richHeroRepository) {
        this.richHeroRepository = richHeroRepository;
    }

    @Transactional
    @CacheEvict(value = "richHeroes", allEntries = true)
    public ImportResult importHeroes(List<RichHeroImportSnapshot> snapshots) {
        if (snapshots == null || snapshots.isEmpty()) {
            return new ImportResult();
        }
        return richHeroRepository.importHeroSnapshot(snapshots);
    }
}
