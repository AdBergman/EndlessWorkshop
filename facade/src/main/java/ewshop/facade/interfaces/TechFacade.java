package ewshop.facade.interfaces;

import ewshop.facade.dto.TechDto;
import java.util.List;

public interface TechFacade {
    /**
     * Returns all Techs as DTOs.
     */
    List<TechDto> getAllTechs();
}
