package ewshop.domain.service;

import ewshop.domain.command.TechImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.model.results.TechImportPreview;
import ewshop.domain.repository.TechRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

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

        TechImportPreview preview = previewSnapshot(techImportSnapshots);

        if (preview.importableSnapshots().isEmpty()) {
            throw new IllegalStateException("Tech import produced 0 public techs; refusing to write/delete.");
        }

        return techRepository.importTechSnapshot(preview.importableSnapshots());
    }

    public TechImportPreview previewSnapshot(List<TechImportSnapshot> techImportSnapshots) {
        if (techImportSnapshots == null || techImportSnapshots.isEmpty()) {
            return new TechImportPreview(List.of(), 0, 0);
        }

        Set<String> importedMajorFactions = techImportSnapshots.stream()
                .filter(snapshot -> !snapshot.hidden())
                .map(TechImportSnapshot::factionDisplayName)
                .filter(faction -> faction != null && !faction.isBlank())
                .collect(Collectors.toSet());

        List<TechImportSnapshot> enrichedSnapshots = techImportSnapshots.stream()
                .map(snapshot -> gateEvaluator.withDerivedAvailableFactions(snapshot, importedMajorFactions))
                .toList();

        List<TechImportSnapshot> publicSnapshots = enrichedSnapshots.stream()
                .filter(snapshot -> !snapshot.hidden())
                .filter(snapshot -> snapshot.availableMajorFactions() != null && !snapshot.availableMajorFactions().isEmpty())
                .toList();

        int hidden = (int) enrichedSnapshots.stream()
                .filter(TechImportSnapshot::hidden)
                .count();

        int noAvailableFactions = (int) enrichedSnapshots.stream()
                .filter(snapshot -> !snapshot.hidden())
                .filter(snapshot -> snapshot.availableMajorFactions() == null || snapshot.availableMajorFactions().isEmpty())
                .count();

        return new TechImportPreview(publicSnapshots, hidden, noAvailableFactions);
    }
}
