package com.opale.micro_planning.domain.entities;

import java.util.UUID;

public class TeacherAvailability {
    private UUID teacherId;
    private int weekNumber;
    private String availabilitySlots; // e.g., "1111111111" for 10 slots

    public TeacherAvailability(UUID teacherId, int weekNumber, String availabilitySlots) {
        this.teacherId = teacherId;
        this.weekNumber = weekNumber;
        this.availabilitySlots = availabilitySlots;
    }

    public UUID getTeacherId() {
        return teacherId;
    }

    public int getWeekNumber() {
        return weekNumber;
    }

    public String getAvailabilitySlots() {
        return availabilitySlots;
    }

    public boolean isAvailable(int slotIndex) {
        if (slotIndex < 0 || slotIndex >= availabilitySlots.length()) {
            return false;
        }
        return availabilitySlots.charAt(slotIndex) == '1';
    }
}
