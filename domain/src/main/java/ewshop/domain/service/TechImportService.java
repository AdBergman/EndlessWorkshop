package ewshop.domain.service;

import ewshop.domain.command.TechImportSnapshot;
import ewshop.domain.model.results.TechImportResult;
import ewshop.domain.repository.TechRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TechImportService {

    private final TechRepository techRepository;
    private final TechFactionGateEvaluator gateEvaluator;

    public TechImportService(TechRepository techRepository, TechFactionGateEvaluator gateEvaluator) {
        this.techRepository = techRepository;
        this.gateEvaluator = gateEvaluator;
    }

    @Transactional
    @CacheEvict(value = "techs", allEntries = true)
    public TechImportResult importSnapshot(List<TechImportSnapshot> techs) {
        if (techs == null || techs.isEmpty()) return new TechImportResult();

        List<TechImportSnapshot> enriched = techs.stream()
                .map(gateEvaluator::withDerivedAvailableFactions)
                .toList();

        return techRepository.importTechSnapshot(enriched);
    }
}