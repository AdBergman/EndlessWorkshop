package ewshop.domain.repository;

import ewshop.domain.command.ImprovementImportSnapshot;
import ewshop.domain.model.Improvement;
import ewshop.domain.model.results.ImportResult;

import java.util.List;

public interface ImprovementRepository {


    List<Improvement> findAll();


    ImportResult importImprovementSnapshot(List<ImprovementImportSnapshot> snapshots);
}