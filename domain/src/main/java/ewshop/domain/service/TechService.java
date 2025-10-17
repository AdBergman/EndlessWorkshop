package ewshop.domain.service;

import ewshop.domain.entity.Tech;
import ewshop.domain.repository.TechRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TechService {

    private final TechRepository techRepository;

    public TechService(TechRepository techRepository) {
        this.techRepository = techRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable("techs")
    public List<Tech> getAllTechs() {
        return techRepository.findAll();
    }
}
