package ewshop.facade.integration;

import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootConfiguration
@EnableAutoConfiguration
@EntityScan("ewshop.infrastructure.persistence.entities")
@EnableJpaRepositories("ewshop.infrastructure.persistence.repositories")
@ComponentScan(basePackages = {"ewshop.domain", "ewshop.infrastructure", "ewshop.facade"})
public class IntegrationTestConfig {
}
