package ewshop.domain.service;

import ewshop.domain.entity.Tech;
import ewshop.domain.repository.TechRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TechService {

    private final TechRepository techRepository;

    public TechService(TechRepository techRepository) {
        this.techRepository = techRepository;
    }

    /**
     * Returns all Tech domain entities.
     */
    public List<Tech> getAllTechs() {
        return techRepository.findAll();
    }
}
