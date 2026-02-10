package ewshop.facade.config;

import ewshop.domain.service.*;
import ewshop.facade.impl.*;
import ewshop.facade.interfaces.*;
import ewshop.facade.mapper.UnitDtoPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class FacadeConfig {

    @Bean
    public DistrictFacade districtFacade(DistrictService districtService) {
        return new DistrictFacadeImpl(districtService);
    }

    @Bean
    public ImprovementFacade improvementFacade(ImprovementService improvementService) {
        return new ImprovementFacadeImpl(improvementService);
    }

    @Bean
    @Primary
    public SavedTechBuildFacade savedTechBuildFacade(SavedTechBuildService savedTechBuildService) {
        return new SavedTechBuildFacadeImpl(savedTechBuildService);
    }

    @Bean
    public TechFacade techFacade(TechService techService) {
        return new TechFacadeImpl(techService);
    }

    @Bean
    public TechAdminFacade techAdminFacade(TechService techService) {
        return new TechAdminFacadeImpl(techService);
    }

    @Bean
    public ImportAdminFacade importAdminFacade(TechImportService techImportService) {
        return new TechImportAdminFacadeImpl(techImportService);
    }

    @Bean
    public UnitFacade unitFacade(
            UnitSpecializationService unitSpecializationService,
            UnitDtoPostProcessor postProcessor
    ) {
        return new UnitFacadeImpl(unitSpecializationService, postProcessor);
    }
}