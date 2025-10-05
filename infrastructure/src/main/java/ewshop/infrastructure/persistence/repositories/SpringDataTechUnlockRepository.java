package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.TechUnlockEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpringDataTechUnlockRepository extends JpaRepository<TechUnlockEntity, Long> {

    /**
     * Fetch all unlocks for a given Tech by its ID.
     * Useful for seeding or queries.
     */
    List<TechUnlockEntity> findByTechId(Long techId);

}
