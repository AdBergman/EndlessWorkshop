package ewshop.domain.service;

import ewshop.domain.entity.Tech;
import ewshop.domain.repository.TechRepository; // <-- domain port
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TechService {

    private final TechRepository techRepository; // <-- domain interface

    public TechService(TechRepository techRepository) {
        this.techRepository = techRepository;
    }

    public List<String> getAllTechNames() {
        return techRepository.findAll()
                .stream()
                .map(Tech::getName)  // <-- domain entity, not persistence entity
                .collect(Collectors.toList());
    }
}
