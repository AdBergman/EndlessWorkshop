package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.TechEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpringDataTechRepository extends JpaRepository<TechEntity, Long> {
    Optional<TechEntity> findByName(String name);

    @EntityGraph(attributePaths = {"unlocks", "unlocks.unitSpecialization", "unlocks.improvement", "unlocks.district"})
    List<TechEntity> findAll();

}
