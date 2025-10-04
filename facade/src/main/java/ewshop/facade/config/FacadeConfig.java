package ewshop.facade.config;

import ewshop.domain.service.TechService;
import ewshop.facade.impl.TechFacadeImpl;
import ewshop.facade.interfaces.TechFacade;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FacadeConfig {

    @Bean
    public TechFacade techFacade(TechService techService) {
        return new TechFacadeImpl(techService);
    }
}