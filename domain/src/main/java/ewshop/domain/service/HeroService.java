package ewshop.domain.service;

import ewshop.domain.model.Hero;
import ewshop.domain.repository.HeroRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class HeroService {

    private final HeroRepository heroRepository;

    public HeroService(HeroRepository heroRepository) {
        this.heroRepository = heroRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable("heroes")
    public List<Hero> getAllHeroes() {
        return heroRepository.findAll();
    }
}
