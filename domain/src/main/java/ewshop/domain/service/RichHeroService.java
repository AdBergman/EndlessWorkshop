package ewshop.domain.service;

import ewshop.domain.model.RichHero;
import ewshop.domain.repository.RichHeroRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RichHeroService {

    private final RichHeroRepository richHeroRepository;

    public RichHeroService(RichHeroRepository richHeroRepository) {
        this.richHeroRepository = richHeroRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable("richHeroes")
    public List<RichHero> getAllHeroes() {
        return richHeroRepository.findAll();
    }
}
