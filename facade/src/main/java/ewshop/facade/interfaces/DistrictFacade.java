package ewshop.facade.interfaces;


import ewshop.facade.dto.response.DistrictDto;

import java.util.List;

/**
 * Facade interface for accessing Districts as DTOs.
 * Implemented by the infrastructure/facade layer.
 */
public interface DistrictFacade {

    /**
     * Returns all Districts as DTOs.
     */
    List<DistrictDto> getAllDistricts();
}
