package ewshop.facade.impl;

import ewshop.domain.service.DistrictService;
import ewshop.facade.dto.response.DistrictDto;
import ewshop.facade.interfaces.DistrictFacade;
import ewshop.facade.mapper.DistrictMapper;

import java.util.List;

public class DistrictFacadeImpl implements DistrictFacade {

    private final DistrictService districtService;

    public DistrictFacadeImpl(DistrictService districtService) {
        this.districtService = districtService;
    }

    @Override
    public List<DistrictDto> getAllDistricts() {
        return districtService.getAllDistricts().stream()
                .map(DistrictMapper::toDto)
                .toList();
    }
}
