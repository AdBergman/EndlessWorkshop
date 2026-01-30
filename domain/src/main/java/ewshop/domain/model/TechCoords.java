package ewshop.domain.model;

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

    public double getXPct() {
        return xPct;
    }

    public void setXPct(double xPct) {
        this.xPct = xPct;
    }

    public double getYPct() {
        return yPct;
    }

    public void setYPct(double yPct) {
        this.yPct = yPct;
    }
}
