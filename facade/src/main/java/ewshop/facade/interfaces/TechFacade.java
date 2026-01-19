package ewshop.facade.interfaces;

import ewshop.facade.dto.response.TechDto;
import java.util.List;

public interface TechFacade {

    List<TechDto> getAllTechs();
}
