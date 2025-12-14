package ewshop.facade.integration;

import ewshop.facade.config.FacadeConfig;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@Import(FacadeConfig.class)
@SpringBootTest(classes = IntegrationTestConfig.class)
@ActiveProfiles("dev")
@Transactional
public abstract class BaseIT {
}
