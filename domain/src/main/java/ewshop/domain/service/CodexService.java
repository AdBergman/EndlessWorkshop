package ewshop.domain.service;

import ewshop.domain.model.Codex;
import ewshop.domain.repository.CodexRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CodexService {

    private final CodexRepository codexRepository;

    public CodexService(CodexRepository codexRepository) {
        this.codexRepository = codexRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable("codex")
    public List<Codex> getAllCodexEntries() {
        return codexRepository.findAll();
    }
}