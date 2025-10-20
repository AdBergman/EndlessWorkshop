package ewshop.facade.interfaces;

import ewshop.facade.dto.response.UnitDto;

import java.util.List;

/**
 * Facade interface for accessing Units as DTOs.
 * Implemented by the infrastructure/facade layer.
 */
public interface UnitFacade {

    /**
     * Returns all Units as DTOs.
     */
    List<UnitDto> getAllUnits();
}
