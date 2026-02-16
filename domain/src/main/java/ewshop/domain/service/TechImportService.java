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
    public ImportResult importSnapshot(List<TechImportSnapshot> techImportSnapshots) {
        if (techImportSnapshots == null || techImportSnapshots.isEmpty()) {
            return new ImportResult();
        }

        List<TechImportSnapshot> enrichedSnapshots = techImportSnapshots.stream()
                .map(gateEvaluator::withDerivedAvailableFactions)
                .toList();

        List<TechImportSnapshot> publicSnapshots = enrichedSnapshots.stream()
                .filter(snapshot -> !snapshot.hidden())
                .filter(snapshot -> snapshot.availableFactions() != null && !snapshot.availableFactions().isEmpty())
                .toList();

        if (!enrichedSnapshots.isEmpty() && publicSnapshots.isEmpty()) {
            throw new IllegalStateException("Tech import produced 0 public techs; refusing to write/delete.");
        }

        return techRepository.importTechSnapshot(publicSnapshots);
    }
}