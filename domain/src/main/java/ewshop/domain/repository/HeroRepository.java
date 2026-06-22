package ewshop.domain.repository;

import ewshop.domain.command.HeroImportSnapshot;
import ewshop.domain.model.Hero;
import ewshop.domain.model.results.ImportResult;

import java.util.List;

public interface HeroRepository {
    List<Hero> findAll();
    ImportResult importHeroSnapshot(List<HeroImportSnapshot> snapshots);
}
