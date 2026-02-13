package ewshop.domain.repository;

import ewshop.domain.command.TechImportSnapshot;
import ewshop.domain.command.TechPlacementUpdate;
import ewshop.domain.model.Tech;
import ewshop.domain.model.results.TechImportResult;

import java.util.List;

public interface TechRepository {

    Tech save(Tech tech);

    void saveAll(List<Tech> techs);

    List<Tech> findAll();

    void deleteAll();

    void updateEraAndCoordsByNameAndType(TechPlacementUpdate update);

    TechImportResult importTechSnapshot(List<TechImportSnapshot> techs);
}
