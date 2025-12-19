package com.opale.micro_planning.domain.constraints;

import com.opale.micro_planning.domain.Scheduler;
import com.opale.micro_planning.domain.entities.Cours;
import com.opale.micro_planning.domain.entities.CourseVariables;
import com.opale.micro_planning.domain.entities.Salle;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class ConstraintData {
    public final List<Cours> courses;
    public final List<Salle> availableRooms;
    public final Map<Cours, CourseVariables> courseVars;
    public final List<LocalDate> availableDays;
    public final Scheduler scheduler;


    public ConstraintData(List<Cours> courses, List<Salle> availableRooms, Map<Cours, CourseVariables> courseVars,
                          List<LocalDate> availableDays, Scheduler scheduler) {
        this.courses = courses;
        this.courseVars = courseVars;
        this.availableRooms = availableRooms;
        this.availableDays = availableDays;
        this.scheduler = scheduler;
    }
}
