package ewshop.domain.model.results;

public class ImportResult {

    private int received;
    private int inserted;
    private int updated;
    private int unchanged;
    private int deleted;
    private int failed;

    public void incrementReceived() { received++; }
    public void incrementInserted() { inserted++; }
    public void incrementUpdated() { updated++; }
    public void incrementUnchanged() { unchanged++; }
    public void incrementFailed() { failed++; }

    public void setDeleted(int deleted) { this.deleted = deleted; }

    public int getReceived() { return received; }
    public int getInserted() { return inserted; }
    public int getUpdated() { return updated; }
    public int getUnchanged() { return unchanged; }
    public int getDeleted() { return deleted; }
    public int getFailed() { return failed; }
}