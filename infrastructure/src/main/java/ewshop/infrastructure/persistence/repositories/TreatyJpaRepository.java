package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.TreatyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TreatyJpaRepository extends JpaRepository<TreatyEntity, Long> {
    Optional<TreatyEntity> findByName(String name);
}
