package ewshop.domain.service;

import ewshop.domain.entity.Improvement;
import ewshop.domain.repository.ImprovementRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ImprovementService {

    private final ImprovementRepository improvementRepository;

    public ImprovementService(ImprovementRepository improvementRepository) {
        this.improvementRepository = improvementRepository;
    }

    /**
     * Returns all Improvement domain entities.
     */
    public List<Improvement> getAllImprovements() {
        return improvementRepository.findAll();
    }
}
