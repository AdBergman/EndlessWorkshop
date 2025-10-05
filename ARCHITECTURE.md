# Project Architecture (Hexagonal)

    +-------------------------+
    |       API Module        |  <- Controllers / REST endpoints
    |  (Spring MVC / Web)     |
    +-----------+-------------+
                |
                v
    +-------------------------+
    |      Facade Module       |  <- ewshop.app.Application / Use Case Layer
    |  (Maps DTOs, orchestrates|
    |   services in domain)    |
    +-----------+-------------+
                |
                v
    +---------------------------+
    |     Domain Module         |  <- Core business logic + persistence
    | - Domain Objects          |
    | - Value Objects           |
    | - Domain Services         |
    |---------------------------|
    | - Repository Interfaces   |
    | - JPA Entities            |
    | - Spring Data Repositories|
    | - Repository Mappers      |
    +---------------------------+


### Notes

- **API module**: only calls Facade interfaces; doesn’t know domain internals.
- **Facade module**: orchestrates domain logic, maps DTOs, handles transactions, and calls repository interfaces.
- **Domain module**: contains pure domain objects (no framework annotations) and persistence objects (JPA entities, repositories, mappers) in separate packages.
- **Packages separate concerns**:
    - `entity`: pure domain objects + value objects
    - `repository`: repository interfaces + JPA entities + mappers + Spring Data repositories
    - `services`: domain services / business logic
- **Trade-off**: Folding persistence and domain into the same module reduces boilerplate and simplifies the project for small scale, at the cost of purer hexagonal separation.
- **Facade logic**: all “clever” business logic lives in the facade; domain objects are mostly data holders.