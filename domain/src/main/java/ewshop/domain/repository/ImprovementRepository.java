package ewshop.domain.repository;

import ewshop.domain.entity.Improvement;

import java.util.List;

public interface ImprovementRepository {

    Improvement save(Improvement improvement);

    void saveAll(List<Improvement> improvements);

    List<Improvement> findAll();

    void deleteAll();
}
