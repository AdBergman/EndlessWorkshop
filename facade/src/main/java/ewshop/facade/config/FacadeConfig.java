package ewshop.facade.config;

import ewshop.domain.service.*;
import ewshop.facade.impl.*;
import ewshop.facade.interfaces.*;
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
    public TechImportAdminFacade techImportAdminFacade(TechImportService techImportService, TechService techService) {
        return new TechImportAdminFacadeImpl(techImportService, techService);
    }

    @Bean
    public DistrictImportAdminFacade districtImportAdminFacade(DistrictImportService districtImportService,
                                                               DistrictService districtService) {
        return new DistrictImportAdminFacadeImpl(districtImportService, districtService);
    }

    @Bean
    public ImprovementImportAdminFacade improvementImportAdminFacade(
            ImprovementImportService improvementImportService,
            ImprovementService improvementService
    ) {
        return new ImprovementImportAdminFacadeImpl(improvementImportService, improvementService);
    }

    @Bean
    public UnitFacade unitFacade(
            UnitService unitService
    ) {
        return new UnitFacadeImpl(unitService);
    }

    @Bean
    public UnitImportAdminFacade unitImportAdminFacade(
            UnitImportService unitImportService,
            UnitService unitService
    ) {
        return new UnitImportAdminFacadeImpl(unitImportService, unitService);
    }

    @Bean
    public CodexFacade codexFacade(CodexService codexService) {
        return new CodexFacadeImpl(codexService);
    }

    @Bean
    public CodexImportAdminFacade codexImportAdminFacade(
            CodexImportService codexImportService,
            CodexService codexService
    ) {
        return new CodexImportAdminFacadeImpl(codexImportService, codexService);
    }
}