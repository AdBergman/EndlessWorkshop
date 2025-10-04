package ewshop.domain.repository;

import ewshop.domain.entity.Tech;

import java.util.List;
import java.util.Optional;

/**
 * Domain port for accessing Tech entities.
 * Implemented by the infrastructure layer.
 */
public interface TechRepository {

    Tech save(Tech tech);

    Optional<Tech> findByName(String name);

    List<Tech> findAll();
}
