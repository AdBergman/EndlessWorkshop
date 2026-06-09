ALTER TABLE codex
    ADD COLUMN IF NOT EXISTS facts_json TEXT;

ALTER TABLE codex
    ADD COLUMN IF NOT EXISTS sections_json TEXT;

CREATE TABLE IF NOT EXISTS codex_public_context_keys (
                                                         codex_id BIGINT NOT NULL,
                                                         context_index INTEGER NOT NULL,
                                                         context_key VARCHAR(220) NOT NULL,
                                                         CONSTRAINT pk_codex_public_context_keys PRIMARY KEY (codex_id, context_index),
                                                         CONSTRAINT fk_codex_public_context_keys_codex
                                                             FOREIGN KEY (codex_id) REFERENCES codex(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_codex_public_context_keys_codex_id
    ON codex_public_context_keys(codex_id);

CREATE INDEX IF NOT EXISTS idx_codex_public_context_keys_context_key
    ON codex_public_context_keys(context_key);

CREATE UNIQUE INDEX IF NOT EXISTS uq_codex_public_context_keys_key
    ON codex_public_context_keys(codex_id, context_key);
