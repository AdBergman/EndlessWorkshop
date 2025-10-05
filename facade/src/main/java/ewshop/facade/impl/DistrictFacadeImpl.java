package ewshop.facade.impl;

import ewshop.domain.service.DistrictService;
import ewshop.facade.dto.DistrictDto;
import ewshop.facade.interfaces.DistrictFacade;
import ewshop.facade.mapper.DistrictMapper;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
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
