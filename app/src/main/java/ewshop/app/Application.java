package ewshop.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "ewshop")
@EnableJpaRepositories(basePackages = "ewshop")
@EntityScan(basePackages = "ewshop")
@EnableScheduling
@EnableCaching
@EnableAsync
public class Application {
    // Keep the conventional public Spring Boot entry point for launch tooling.
    @SuppressWarnings("UnnecessaryModifier")
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
