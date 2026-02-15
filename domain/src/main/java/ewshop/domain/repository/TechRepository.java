package ewshop.domain.repository;

import ewshop.domain.command.TechImportSnapshot;
import ewshop.domain.command.TechPlacementUpdate;
import ewshop.domain.model.Tech;
import ewshop.domain.model.results.ImportResult;

import java.util.List;

public interface TechRepository {

    Tech save(Tech tech);

    void saveAll(List<Tech> techs);

    List<Tech> findAll();

    void deleteAll();

    void updateEraAndCoordsByTechKey(TechPlacementUpdate update);

    ImportResult importTechSnapshot(List<TechImportSnapshot> techs);
}
