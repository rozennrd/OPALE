package com.opale.micro_planning.domain;

import com.google.ortools.Loader;
import com.google.ortools.sat.*;
import com.opale.micro_planning.domain.constraints.*;
import com.opale.micro_planning.domain.entities.*;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.DayOfWeek;
import java.util.*;

import static com.opale.micro_planning.domain.constraints.SchedulingConstants.*;

public class Scheduler {
    private List<BaseConstraintHandler> constraintHandlers;
    private final LocalDate schedulingStartDate;
    private final LocalDate schedulingEndDate;
    @Getter
    private final List<Salle> availableRooms;

    public Scheduler(LocalDate startDate, LocalDate endDate, List<Salle> availableRooms) {
        Loader.loadNativeLibraries();
        this.schedulingStartDate = startDate;
        this.schedulingEndDate = endDate;
        this.availableRooms = availableRooms;
        this.constraintHandlers = List.of(
                new TimeConstraintsHandler(),
                new HumanConstraintsHandler(),
                new RoomConstraintsHandler(),
                new LunchConstraintsHandler()
        );
    }

    private final ArrayList<Cours> courses = new ArrayList<>();

    @Getter
    private Map<Cours, ScheduledSlot> schedule = new HashMap<>();
    @Getter
    private Map<Cours, Salle> roomAssignments = new HashMap<>();

    public void createCoursesToSchedule(ArrayList<Enseignement> enseignements) {
        for (Enseignement enseignement : enseignements) {
            courses.addAll(enseignement.breakIntoCourses(4));
        }
    }

    public boolean scheduleCourses() {
        CpModel model = new CpModel();

        // Calculate available days
        List<LocalDate> availableDays = getWorkingDays(schedulingStartDate, schedulingEndDate);
        int numDays = availableDays.size();

        // Create variables for each course
        Map<Cours, CourseVariables> courseVars = createCourseVariables(model, numDays);
        // Add all constraints
        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, this);
        List<IntVar> allPenalties = new ArrayList<>();

        for (BaseConstraintHandler handler : constraintHandlers) {
            allPenalties.addAll(handler.addConstraints(model, this, data));
        }

        // Minimize penalties (soft constraints)
        if (!allPenalties.isEmpty()) {
            model.minimize(LinearExpr.sum(allPenalties.toArray(new IntVar[0])));
        }

        // Solve
        CpSolver solver = new CpSolver();
        solver.getParameters().setMaxTimeInSeconds(60.0);

        CpSolverStatus status = solver.solve(model);

        if (status == CpSolverStatus.OPTIMAL || status == CpSolverStatus.FEASIBLE) {
            extractSolution(solver, courseVars, availableDays);
            System.out.println("Solution found! Status: " + status);
            return true;
        } else {
            System.out.println("No solution found. Status: " + status);
            return false;
        }
    }

    /**
     * Create all decision variables for courses (day, start time, end time, room)
     */
    private Map<Cours, CourseVariables> createCourseVariables(CpModel model, int numDays) {
        Map<Cours, CourseVariables> courseVars = new HashMap<>();

        for (int i = 0; i < courses.size(); i++) {
            Cours course = courses.get(i);
            int durationMinutes = course.getDurationMinutes();

            // Day variable: which day (0 to numDays-1)
            IntVar dayVar = model.newIntVar(0, numDays - 1, "course_" + i + "_day");

            // Start time variable: minutes from 8:00
            int latestStart = TOTAL_DAY_MINUTES - durationMinutes;
            IntVar startVar = model.newIntVar(0, latestStart, "course_" + i + "_start");

            // End time variable: computed as start + duration
            IntVar endVar = model.newIntVar(durationMinutes, TOTAL_DAY_MINUTES, "course_" + i + "_end");
            model.addEquality(endVar, LinearExpr.sum(new IntVar[]{startVar, model.newConstant(durationMinutes)}));

            // Room variable: which room (0 to numRooms-1)
            IntVar roomVar = model.newIntVar(0, availableRooms.size() - 1, "course_" + i + "_room");

            courseVars.put(course, new CourseVariables(dayVar, startVar, endVar, roomVar, durationMinutes));
        }

        return courseVars;
    }

    /**
     * Extract the solution from the solver and populate schedule and roomAssignments
     */
    private void extractSolution(CpSolver solver, Map<Cours, CourseVariables> courseVars,
                                 List<LocalDate> availableDays) {
        for (Map.Entry<Cours, CourseVariables> entry : courseVars.entrySet()) {
            Cours course = entry.getKey();
            CourseVariables vars = entry.getValue();

            // Extract day, start, end from solver
            int dayIndex = (int) solver.value(vars.getDayVar());
            int startMinutes = (int) solver.value(vars.getStartVar());
            int endMinutes = (int) solver.value(vars.getEndVar());
            int roomIndex = (int) solver.value(vars.getRoomVar());

            // Convert to LocalDateTime
            LocalDate date = availableDays.get(dayIndex);
            LocalDateTime startTime = date.atTime(0, 0).plusMinutes(DAY_START_MINUTES + startMinutes);
            LocalDateTime endTime = date.atTime(0, 0).plusMinutes(DAY_START_MINUTES + endMinutes);

            // Get assigned room
            Salle assignedRoom = availableRooms.get(roomIndex);

            // Store results
            schedule.put(course, new ScheduledSlot(date, startTime, endTime));
            roomAssignments.put(course, assignedRoom);

            System.out.println("Course " + course.getId() + ": " + startTime + " -> " + endTime +
                               " in " + assignedRoom.getNom());
        }
    }

    /**
     * Get all working days (exclude weekends)
     */
    private List<LocalDate> getWorkingDays(LocalDate start, LocalDate end) {
        List<LocalDate> days = new ArrayList<>();
        LocalDate current = start;

        while (!current.isAfter(end)) {
            if (current.getDayOfWeek() != DayOfWeek.SATURDAY &&
                current.getDayOfWeek() != DayOfWeek.SUNDAY) {
                days.add(current);
            }
            current = current.plusDays(1);
        }

        return days;
    }
}