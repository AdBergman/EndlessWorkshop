package ewshop.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "ewshop")
@EnableJpaRepositories(basePackages = "ewshop")
@EntityScan(basePackages = "ewshop")
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

}
