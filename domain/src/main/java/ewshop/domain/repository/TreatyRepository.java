package ewshop.domain.repository;

import ewshop.domain.model.Treaty;

import java.util.Optional;

public interface TreatyRepository {
    Treaty save(Treaty treaty);
    Optional<Treaty> findByName(String name);
}
