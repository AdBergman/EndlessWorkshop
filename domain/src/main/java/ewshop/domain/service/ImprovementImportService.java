package ewshop.domain.service;

import ewshop.domain.command.ImprovementImportSnapshot;
import ewshop.domain.model.results.ImportResult;
import ewshop.domain.repository.ImprovementRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ImprovementImportService {

    private final ImprovementRepository improvementRepository;

    public ImprovementImportService(ImprovementRepository improvementRepository) {
        this.improvementRepository = improvementRepository;
    }

    public ImportResult importImprovements(List<ImprovementImportSnapshot> snapshots) {
        if (snapshots == null || snapshots.isEmpty()) {
            return new ImportResult();
        }

        return improvementRepository.importImprovementSnapshot(snapshots);
    }
}