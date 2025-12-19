package com.opale.micro_planning.domain.constraints;

public interface SchedulingConstants {
    // Time constants in minutes from midnight
    int DAY_START_MINUTES = 8 * 60;        // 8:00 = 480 minutes
    int LUNCH_START_MINUTES = 12 * 60 + 30; // 12:30 = 750 minutes
    int LUNCH_END_MINUTES = 13 * 60 + 30;   // 13:30 = 810 minutes
    int DAY_END_MINUTES = 18 * 60;         // 18:00 = 1080 minutes

    // Derived constants (computed from above)
    int LUNCH_START_FROM_DAY_START = LUNCH_START_MINUTES - DAY_START_MINUTES;
    int LUNCH_END_FROM_DAY_START = LUNCH_END_MINUTES - DAY_START_MINUTES;
    int TOTAL_DAY_MINUTES = DAY_END_MINUTES - DAY_START_MINUTES;
}
