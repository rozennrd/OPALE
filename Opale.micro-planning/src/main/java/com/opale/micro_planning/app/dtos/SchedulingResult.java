package com.opale.micro_planning.app.dtos;

import java.util.Map;
import java.util.UUID;

public class SchedulingResult {
    private UUID scheduleId;
    private boolean success;
    private Map<String, Object> schedule; // Simplified representation
    private int totalCourses;
    private String message;

    public SchedulingResult() {}

    public SchedulingResult(UUID scheduleId, boolean success, Map<String, Object> schedule,
                           int totalCourses, String message) {
        this.scheduleId = scheduleId;
        this.success = success;
        this.schedule = schedule;
        this.totalCourses = totalCourses;
        this.message = message;
    }

    // Getters and setters
    public UUID getScheduleId() { return scheduleId; }
    public void setScheduleId(UUID scheduleId) { this.scheduleId = scheduleId; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public Map<String, Object> getSchedule() { return schedule; }
    public void setSchedule(Map<String, Object> schedule) { this.schedule = schedule; }

    public int getTotalCourses() { return totalCourses; }
    public void setTotalCourses(int totalCourses) { this.totalCourses = totalCourses; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
