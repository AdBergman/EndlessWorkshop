package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.ConvertorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConvertorJpaRepository extends JpaRepository<ConvertorEntity, Long> {
    Optional<ConvertorEntity> findByName(String name);
}
