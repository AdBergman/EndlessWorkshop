package ewshop.domain.repository;

import ewshop.domain.entity.Tech;

import java.util.List;
import java.util.Map;

public interface TechRepository {

    Tech save(Tech tech);

    void saveAll(List<Tech> techs);

    List<Tech> findAll();

    void deleteAll();

    /**
     * Replaces all relationships with the provided state.
     */
    void updateRelationships(Map<String, Tech> techDomainMap);
}
