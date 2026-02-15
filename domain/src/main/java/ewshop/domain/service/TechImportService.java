package ewshop.domain.service;

import ewshop.domain.command.TechImportSnapshot;
import ewshop.domain.model.results.ImportResult;
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
    public ImportResult importSnapshot(List<TechImportSnapshot> techs) {
        if (techs == null || techs.isEmpty()) return new ImportResult();

        List<TechImportSnapshot> enriched = techs.stream()
                .map(gateEvaluator::withDerivedAvailableFactions)
                .toList();

        // filter: never store hidden or no factions
        List<TechImportSnapshot> publicOnly = enriched.stream()
                .filter(t -> !t.hidden())
                .filter(t -> t.availableFactions() != null && !t.availableFactions().isEmpty())
                .toList();

        // fail-safe
        if (!enriched.isEmpty() && publicOnly.isEmpty()) {
            throw new IllegalStateException("Tech import produced 0 public techs; refusing to write/delete.");
        }

        return techRepository.importTechSnapshot(publicOnly);
    }
}