package ewshop.domain.repository;

import ewshop.domain.entity.Treaty;

import java.util.Optional;

/**
 * The repository port for the Treaty domain.
 * This interface is owned by the domain and implemented by the infrastructure layer.
 */
public interface TreatyRepository {
    Treaty save(Treaty treaty);
    Optional<Treaty> findByName(String name);
}
