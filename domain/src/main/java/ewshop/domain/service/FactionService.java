package ewshop.domain.service;

import ewshop.domain.model.Faction;
import ewshop.domain.repository.FactionRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FactionService {

    private final FactionRepository factionRepository;

    public FactionService(FactionRepository factionRepository) {
        this.factionRepository = factionRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable("factions")
    public List<Faction> getAllFactions() {
        return factionRepository.findAll();
    }
}
