package ewshop.infrastructure;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * A single, central Spring Boot application class for all tests within the infrastructure module.
 * This class provides the necessary configuration for test slices like @DataJpaTest.
 */
@SpringBootApplication
@EnableJpaRepositories(basePackages = "ewshop.infrastructure.persistence.repositories")
@EntityScan(basePackages = {"ewshop.domain.entity", "ewshop.infrastructure.persistence.entities"})
public class TestInfrastructureApplication {
    // main method not needed for tests
}