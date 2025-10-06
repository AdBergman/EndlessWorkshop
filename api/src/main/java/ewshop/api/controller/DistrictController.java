package ewshop.api.controller;

import ewshop.facade.dto.response.DistrictDto;
import ewshop.facade.interfaces.DistrictFacade;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class DistrictController {

    private final DistrictFacade districtFacade;

    public DistrictController(DistrictFacade districtFacade) {
        this.districtFacade = districtFacade;
    }

    @GetMapping("/api/districts")
    public List<DistrictDto> getAllDistricts() {
        return districtFacade.getAllDistricts();
    }
}
