package ewshop.infrastructure.persistence.repositories;

import ewshop.infrastructure.persistence.entities.ImportRunEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImportRunJpaRepository extends JpaRepository<ImportRunEntity, Long> {
}
