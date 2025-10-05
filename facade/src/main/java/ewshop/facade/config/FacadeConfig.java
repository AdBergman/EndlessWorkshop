package ewshop.facade.config;

import ewshop.domain.service.TechService;
import ewshop.domain.service.DistrictService;
import ewshop.domain.service.ImprovementService;
import ewshop.facade.impl.TechFacadeImpl;
import ewshop.facade.impl.DistrictFacadeImpl;
import ewshop.facade.impl.ImprovementFacadeImpl;
import ewshop.facade.interfaces.TechFacade;
import ewshop.facade.interfaces.DistrictFacade;
import ewshop.facade.interfaces.ImprovementFacade;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FacadeConfig {

    @Bean
    public TechFacade techFacade(TechService techService) {
        return new TechFacadeImpl(techService);
    }

    @Bean
    public DistrictFacade districtFacade(DistrictService districtService) {
        return new DistrictFacadeImpl(districtService);
    }

    @Bean
    public ImprovementFacade improvementFacade(ImprovementService improvementService) {
        return new ImprovementFacadeImpl(improvementService);
    }
}
