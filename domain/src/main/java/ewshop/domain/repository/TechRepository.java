package ewshop.domain.repository;

import ewshop.domain.entity.Tech;

import java.util.List;
import java.util.Map;

/**
 * Domain port for accessing Tech entities.
 * Implemented by the infrastructure layer.
 */
public interface TechRepository {

    Tech save(Tech tech);

    void saveAll(List<Tech> techs);

    List<Tech> findAll();

    void deleteAll();

    /**
     * Updates the prerequisite and exclusion relationships for all technologies in a single transaction.
     * This method uses the provided map as the source of truth for the desired relationships.
     *
     * @param techDomainMap A map where the key is the tech name and the value is the Tech
     *                      domain object containing the desired relationship state.
     */
    void updateRelationships(Map<String, Tech> techDomainMap);
}
