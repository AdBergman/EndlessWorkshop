package ewshop.domain.repository;

import ewshop.domain.command.RichHeroImportSnapshot;
import ewshop.domain.model.RichHero;
import ewshop.domain.model.results.ImportResult;

import java.util.List;

public interface RichHeroRepository {
    List<RichHero> findAll();
    ImportResult importHeroSnapshot(List<RichHeroImportSnapshot> snapshots);
}
