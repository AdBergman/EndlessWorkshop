package ewshop.facade.impl;

import ewshop.domain.service.TechService;
import ewshop.facade.interfaces.TechFacade;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TechFacadeImpl implements TechFacade {

    private final TechService techService;

    public TechFacadeImpl(TechService techService) {
        this.techService = techService;
    }

    @Override
    public List<String> getAllTechNames() {
        return techService.getAllTechNames();
    }
}
