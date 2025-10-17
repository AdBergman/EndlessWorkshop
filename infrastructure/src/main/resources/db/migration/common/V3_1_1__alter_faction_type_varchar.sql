ALTER TABLE shared_tech_builds
    ALTER COLUMN faction TYPE VARCHAR(255);

ALTER TABLE shared_tech_builds
    ALTER COLUMN faction SET NOT NULL;