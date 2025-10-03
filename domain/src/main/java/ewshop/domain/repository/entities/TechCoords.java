package ewshop.domain.repository.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class TechCoords {

    @Column(name = "x_pct", nullable = false)
    private double xPct;

    @Column(name = "y_pct", nullable = false)
    private double yPct;

    public TechCoords() {}

    public TechCoords(double xPct, double yPct) {
        this.xPct = xPct;
        this.yPct = yPct;
    }

    public double getxPct() {
        return xPct;
    }

    public void setxPct(double xPct) {
        this.xPct = xPct;
    }

    public double getyPct() {
        return yPct;
    }

    public void setyPct(double yPct) {
        this.yPct = yPct;
    }
}
