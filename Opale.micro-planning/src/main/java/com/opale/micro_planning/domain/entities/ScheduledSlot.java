package com.opale.micro_planning.domain.entities;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ScheduledSlot {
    private LocalDate date;
    private LocalDateTime start;
    private LocalDateTime end;

    public ScheduledSlot(LocalDate date, LocalDateTime start, LocalDateTime end) {
        this.date = date;
        this.start = start;
        this.end = end;
    }

    public LocalDate getDate() { return date; }
    public LocalDateTime getStart() { return start; }
    public LocalDateTime getEnd() { return end; }
}