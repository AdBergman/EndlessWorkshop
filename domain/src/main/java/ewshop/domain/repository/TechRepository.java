package ewshop.domain.repository;

import ewshop.domain.command.TechPlacementUpdate;
import ewshop.domain.entity.Tech;
import ewshop.domain.entity.TechCoords;
import ewshop.domain.entity.enums.TechType;

import java.util.List;

public interface TechRepository {

    Tech save(Tech tech);

    void saveAll(List<Tech> techs);

    List<Tech> findAll();

    void deleteAll();

    void updateEraAndCoordsByNameAndType(TechPlacementUpdate update);

}
