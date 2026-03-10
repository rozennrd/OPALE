package com.opale.micro_planning.domain.entities;

import com.google.ortools.sat.IntVar;
import lombok.Getter;

@Getter
public class CourseVariables {
    IntVar dayVar;
    IntVar startVar;
    IntVar endVar;
    IntVar roomVar;
    int durationMinutes;

    public CourseVariables(IntVar dayVar, IntVar startVar, IntVar endVar, IntVar roomVar, int durationMinutes) {
        this.dayVar = dayVar;
        this.startVar = startVar;
        this.endVar = endVar;
        this.roomVar = roomVar;
        this.durationMinutes = durationMinutes;
    }
}