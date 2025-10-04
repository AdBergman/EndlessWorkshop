package ewshop.facade.dto;

public class TechDto {

    private String name;
    private int era;
    private String type; // could be enum or string
    private String effects; // or List<String> if you prefer
    private String factions; // maybe a comma-separated string or a list

    public TechDto() {
    }

    public TechDto(String name, int era, String type, String effects, String factions) {
        this.name = name;
        this.era = era;
        this.type = type;
        this.effects = effects;
        this.factions = factions;
    }

    // getters and setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getEra() { return era; }
    public void setEra(int era) { this.era = era; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getEffects() { return effects; }
    public void setEffects(String effects) { this.effects = effects; }

    public String getFactions() { return factions; }
    public void setFactions(String factions) { this.factions = factions; }
}
