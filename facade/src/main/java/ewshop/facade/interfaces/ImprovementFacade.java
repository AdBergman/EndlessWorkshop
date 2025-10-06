package ewshop.facade.interfaces;

import ewshop.facade.dto.response.ImprovementDto;
import java.util.List;

public interface ImprovementFacade {
    /**
     * Returns all Improvements as DTOs.
     */
    List<ImprovementDto> getAllImprovements();
}
