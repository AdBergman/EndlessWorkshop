package ewshop.app.config;

import org.h2.tools.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.sql.SQLException;

@Configuration
public class H2TcpConfig {

    @Value("${h2.tcp.url:jdbc:h2:tcp://localhost:9092/mem:ewshop}")
    private String tcpUrl;

    @Bean
    public Server h2TcpServer() throws SQLException {
        // start the TCP server for external tools (IntelliJ, DBeaver, etc)
        return Server.createTcpServer("-tcp", "-tcpAllowOthers", "-tcpPort", "9092").start();
    }
}
