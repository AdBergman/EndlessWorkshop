package ewshop.facade.interfaces;

import ewshop.facade.dto.response.FactionDto;

import java.util.List;

public interface FactionFacade {
    List<FactionDto> getAllFactions();
}
