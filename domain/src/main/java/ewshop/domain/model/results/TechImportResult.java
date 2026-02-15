package ewshop.domain.model.results;

public class TechImportResult {

    private int inserted;
    private int updated;
    private int unchanged;
    private int deleted;

    public void incrementInserted() { inserted++; }
    public void incrementUpdated() { updated++; }
    public void incrementUnchanged() { unchanged++; }
    public void setDeleted(int deleted) {
        this.deleted = deleted;
    }

    public int getInserted() { return inserted; }
    public int getUpdated() { return updated; }
    public int getUnchanged() { return unchanged; }
    public int getDeleted() {
        return deleted;
    }
}