package com.opale.micro_planning.app.dtos;

import java.time.LocalDate;
import java.util.UUID;

public class SchedulingRequest {
    private UUID promotionId;
    private LocalDate startDate;
    private LocalDate endDate;

    public SchedulingRequest() {}

    public SchedulingRequest(UUID promotionId, LocalDate startDate, LocalDate endDate) {
        this.promotionId = promotionId;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // Getters and setters
    public UUID getPromotionId() { return promotionId; }
    public void setPromotionId(UUID promotionId) { this.promotionId = promotionId; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}
