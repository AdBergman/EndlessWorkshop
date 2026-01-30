package ewshop.domain.repository;

import ewshop.domain.model.UnitSpecialization;

import java.util.List;

public interface UnitSpecializationRepository {

    UnitSpecialization save(UnitSpecialization unitSpecialization);

    void saveAll(List<UnitSpecialization> unitSpecializations);

    UnitSpecialization findByName(String name);

    List<UnitSpecialization> findAll();

    void deleteAll();
}
