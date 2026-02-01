-- Convert tech.type from Postgres enum (tech_type)
-- to VARCHAR to align with JPA @Enumerated(EnumType.STRING)
-- and avoid enum/varchar comparison issues in JPQL updates.

ALTER TABLE tech
    ALTER COLUMN type TYPE varchar(64)
        USING type::text;