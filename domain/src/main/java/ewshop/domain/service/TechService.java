package ewshop.domain.service;

import ewshop.infrastructure.persistence.entities.TechEntity;
import ewshop.infrastructure.persistence.repositories.SpringDataTechRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TechService {

    private final SpringDataTechRepository techRepository;

    public TechService(SpringDataTechRepository techRepository) {
        this.techRepository = techRepository;
    }

    public List<String> getAllTechNames() {
        return techRepository.findAll()
                .stream()
                .map(TechEntity::getName)
                .collect(Collectors.toList());
    }
}
