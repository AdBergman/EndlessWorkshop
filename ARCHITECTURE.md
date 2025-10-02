# Project Architecture (Hexagonal)

    +-------------------------+
    |       API Module        |  <- Controllers / REST endpoints
    |  (Spring MVC / Web)     |
    +-----------+-------------+
                |
                v
    +-------------------------+
    |      Facade Module       |  <- Application / Use Case Layer
    |  (Maps DTOs, orchestrates|
    |   services in domain)    |
    +-----------+-------------+
                |
                v
    +-------------------------+
    |     Domain Module       |  <- Core business logic
    | - Entities              |
    | - Value Objects         |
    | - Domain Services       |
    | - Repository Interfaces |
    +-----------+-------------+
                |
                v
    +-------------------------+
    | Adapters / Infrastructure| <- DB, messaging, external APIs
    | - Spring Data Repos      |
    | - Event Publishers       |
    | - External API Clients   |
    +-------------------------+



### Notes

- **API module**: only calls Facade interfaces; doesn’t know domain internals.
- **Facade module**: orchestrates domain logic, maps DTOs, handles transactions.
- **Domain module**: pure business logic; no framework dependencies.
- **Infrastructure / Adapters**: implement repository interfaces, messaging, external integrations.

