package ewshop.facade.interfaces;

import ewshop.facade.dto.response.ImprovementDto;
import java.util.List;

public interface ImprovementFacade {

    List<ImprovementDto> getAllImprovements();
}
