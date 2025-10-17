package ewshop.domain.service;

import ewshop.domain.entity.Improvement;
import ewshop.domain.repository.ImprovementRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ImprovementService {

    private final ImprovementRepository improvementRepository;

    public ImprovementService(ImprovementRepository improvementRepository) {
        this.improvementRepository = improvementRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable("improvements")
    public List<Improvement> getAllImprovements() {
        return improvementRepository.findAll();
    }
}
