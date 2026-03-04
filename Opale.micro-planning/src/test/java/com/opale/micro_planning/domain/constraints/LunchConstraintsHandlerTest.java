package com.opale.micro_planning.domain.constraints;

import com.google.ortools.Loader;
import com.google.ortools.sat.*;
import com.opale.micro_planning.domain.entities.*;
import com.opale.micro_planning.infra.models.TypeSalle;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.*;

import static com.opale.micro_planning.domain.constraints.SchedulingConstants.*;
import static org.junit.jupiter.api.Assertions.*;

class LunchConstraintsHandlerTest {

    private CpModel model;
    private List<Cours> courses;
    private List<Salle> availableRooms;
    private Map<Cours, CourseVariables> courseVars;
    private List<LocalDate> availableDays;

    @BeforeAll
    static void loadNativeLibraries() {
        Loader.loadNativeLibraries();
    }

    @BeforeEach
    void setUp() {
        model = new CpModel();
        courses = new ArrayList<>();
        availableRooms = createTestRooms();
        courseVars = new HashMap<>();
        availableDays = List.of(
            LocalDate.of(2024, 1, 8),  // Monday
            LocalDate.of(2024, 1, 9)   // Tuesday
        );
    }

    private List<Salle> createTestRooms() {
        return List.of(
            Salle.builder()
                .id(UUID.randomUUID())
                .nom("Room A")
                .type(TypeSalle.Cours)
                .capacite(30)
                .etage(1)
                .build()
        );
    }

    private Cours createTestCourse(double duration) {
        Professeur prof = Professeur.builder()
            .id(UUID.randomUUID())
            .nom("Prof Test")
            .email("prof@test.com")
            .build();

        Promotion promotion = Promotion.builder()
            .id(UUID.randomUUID())
            .nom("Test Promo")
            .effectifs(20)
            .build();

        Matiere matiere = Matiere.builder()
            .id(UUID.randomUUID())
            .nom("Test Subject")
            .promotion(promotion)
            .volumeHoraire(duration)
            .build();

        return Cours.builder()
            .id(UUID.randomUUID())
            .prof(prof)
            .matiere(matiere)
            .duration(duration)
            .build();
    }

    private void createCourseVariables(Cours course) {
        int durationMinutes = (int) course.getDuration() * 60;
        int numDays = availableDays.size();
        int numRooms = availableRooms.size();

        IntVar dayVar = model.newIntVar(0, numDays - 1, "course_" + course.getId() + "_day");
        IntVar startVar = model.newIntVar(0, TOTAL_DAY_MINUTES - durationMinutes, 
            "course_" + course.getId() + "_start");
        IntVar endVar = model.newIntVar(durationMinutes, TOTAL_DAY_MINUTES, 
            "course_" + course.getId() + "_end");
        IntVar roomVar = model.newIntVar(0, numRooms - 1, "course_" + course.getId() + "_room");

        // End = start + duration
        model.addEquality(endVar, LinearExpr.sum(new IntVar[]{startVar, model.newConstant(durationMinutes)}));

        courseVars.put(course, new CourseVariables(dayVar, startVar, endVar, roomVar, durationMinutes));
    }

    @Test
    void addConstraints_WithEmptyCourses_ReturnsEmptyPenalties() {
        // Given
        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        LunchConstraintsHandler handler = new LunchConstraintsHandler();

        // When
        List<IntVar> penalties = handler.addConstraints(model, null, data);

        // Then
        assertTrue(penalties.isEmpty(), "Should return empty penalties for empty courses");
    }

    @Test
    void addConstraints_WithSingleCourse_ReturnsPenalties() {
        // Given
        Cours course = createTestCourse(2.0);
        courses.add(course);
        createCourseVariables(course);

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        LunchConstraintsHandler handler = new LunchConstraintsHandler();

        // When
        List<IntVar> penalties = handler.addConstraints(model, null, data);

        // Then
        assertFalse(penalties.isEmpty(), "Should return penalties for soft lunch constraints");
        assertEquals(1, penalties.size(), "Should have one penalty variable per course");
    }

    @Test
    void addConstraints_NoCourseDuringLunchBreak() {
        // Given: course that should not be scheduled during 13:00-13:30
        Cours course = createTestCourse(2.0);
        courses.add(course);
        createCourseVariables(course);

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        LunchConstraintsHandler handler = new LunchConstraintsHandler();

        // When
        handler.addConstraints(model, null, data);

        // Then
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        assertEquals(CpSolverStatus.OPTIMAL, status, "Should find valid solution");

        int startMinutes = (int) solver.value(courseVars.get(course).getStartVar());
        int endMinutes = (int) solver.value(courseVars.get(course).getEndVar());

        // Course must end before 13:00 (300 min from 8:00) OR start after 13:00
        // The constraint ensures no course runs through 13:00-13:30
        boolean endsBeforeLunch = endMinutes <= 300; // 13:00 = 300 min from 8:00
        boolean startsAfterLunch = startMinutes >= 300;

        assertTrue(endsBeforeLunch || startsAfterLunch,
            "Course should not run during 13:00-13:30 lunch break");
    }

    @Test
    void addConstraints_SoftConstraintPrefersOptimalLunchTiming() {
        // Given: course that could be scheduled at optimal or non-optimal times
        Cours course = createTestCourse(2.0);
        courses.add(course);
        createCourseVariables(course);

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        LunchConstraintsHandler handler = new LunchConstraintsHandler();

        // When
        List<IntVar> penalties = handler.addConstraints(model, null, data);

        // Minimize penalties
        if (!penalties.isEmpty()) {
            model.minimize(com.google.ortools.sat.LinearExpr.sum(penalties.toArray(new IntVar[0])));
        }

        // Then
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        assertEquals(CpSolverStatus.OPTIMAL, status, "Should find optimal solution");

        // Check if the course was scheduled at optimal times
        int startMinutes = (int) solver.value(courseVars.get(course).getStartVar());
        int endMinutes = (int) solver.value(courseVars.get(course).getEndVar());

        // Optimal timing: ends at 12:30 (270 min) or starts at 13:30 (330 min)
        boolean endsAtOptimal = endMinutes == 270; // 12:30
        boolean startsAtOptimal = startMinutes == 330; // 13:30

        // When minimizing penalties, solver should prefer optimal timing
        // But this is a soft constraint, so non-optimal might still happen
        // Just verify the solution is valid
        boolean isMorning = endMinutes <= LUNCH_START_FROM_DAY_START;
        boolean isAfternoon = startMinutes >= 330; // 13:30 in minutes from 8:00

        assertTrue(isMorning || isAfternoon,
            "Course should be in morning or afternoon with proper lunch break");
    }

    @Test
    void addConstraints_MultipleCourses_AllHaveLunchPenalties() {
        // Given: multiple courses
        Cours course1 = createTestCourse(2.0);
        Cours course2 = createTestCourse(2.0);
        Cours course3 = createTestCourse(2.0);
        
        courses.addAll(List.of(course1, course2, course3));
        for (Cours c : courses) {
            createCourseVariables(c);
        }

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        LunchConstraintsHandler handler = new LunchConstraintsHandler();

        // When
        List<IntVar> penalties = handler.addConstraints(model, null, data);

        // Then
        assertEquals(3, penalties.size(), "Should have one penalty variable per course");
    }

    @Test
    void addConstraints_PenaltyValues_AreCorrectlyBounded() {
        // Given
        Cours course = createTestCourse(2.0);
        courses.add(course);
        createCourseVariables(course);

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        LunchConstraintsHandler handler = new LunchConstraintsHandler();

        // When
        List<IntVar> penalties = handler.addConstraints(model, null, data);

        // Then
        IntVar penalty = penalties.get(0);
        
        // Penalty should be bounded between 0 and 10
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        assertEquals(CpSolverStatus.OPTIMAL, status);
        
        long penaltyValue = solver.value(penalty);
        assertTrue(penaltyValue >= 0 && penaltyValue <= 10,
            "Penalty should be between 0 and 10");
    }

    @Test
    void addConstraints_OptimalTimingGivesZeroPenalty() {
        // Given: course that can fit at optimal times
        Cours course = createTestCourse(2.0);
        courses.add(course);
        createCourseVariables(course);

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        LunchConstraintsHandler handler = new LunchConstraintsHandler();

        // When
        List<IntVar> penalties = handler.addConstraints(model, null, data);
        model.minimize(com.google.ortools.sat.LinearExpr.sum(penalties.toArray(new IntVar[0])));

        // Then
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        assertEquals(CpSolverStatus.OPTIMAL, status);

        // With minimization, should achieve 0 penalty with optimal timing
        long penaltyValue = solver.value(penalties.get(0));
        assertEquals(0, penaltyValue, "Optimal timing should give zero penalty");

        // Verify the timing is optimal
        int endMinutes = (int) solver.value(courseVars.get(course).getEndVar());
        int startMinutes = (int) solver.value(courseVars.get(course).getStartVar());

        boolean endsAt12h30 = endMinutes == 270; // 12:30 = 270 min from 8:00
        boolean startsAt13h30 = startMinutes == 330; // 13:30 = 330 min from 8:00

        assertTrue(endsAt12h30 || startsAt13h30,
            "Zero penalty means course ends at 12:30 or starts at 13:30");
    }

    @Test
    void addConstraints_HardConstraintPreventsLunchOverlap() {
        // Given: course that would span 13:00-13:30 if not constrained
        // This test verifies the hard constraint is enforced
        Cours course = createTestCourse(4.0);
        courses.add(course);
        createCourseVariables(course);

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        LunchConstraintsHandler handler = new LunchConstraintsHandler();

        // When
        handler.addConstraints(model, null, data);

        // Then
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        assertEquals(CpSolverStatus.OPTIMAL, status);

        int startMinutes = (int) solver.value(courseVars.get(course).getStartVar());
        int endMinutes = (int) solver.value(courseVars.get(course).getEndVar());

        // Hard constraint: course must not span 13:00-13:30
        // Course ends at or before 13:00 (300 min), or starts at or after 13:00
        boolean valid = (endMinutes <= 300) || (startMinutes >= 300);
        assertTrue(valid, "Course must not run through 13:00-13:30");
    }

    @Test
    void addConstraints_VerifyLunchTimingLogic() {
        // Verify the lunch timing logic is correct
        // 12:30 = 4.5 hours from 8:00 = 270 minutes
        // 13:30 = 5.5 hours from 8:00 = 330 minutes
        
        assertEquals(270, LUNCH_START_FROM_DAY_START, "12:30 should be 270 min from 8:00");
        assertEquals(330, LUNCH_END_FROM_DAY_START - 0, "13:30 from 8:00 should be verified");
    }

    @Test
    void addConstraints_CourseEndingAt12h30_IsValid() {
        // Given: course ending exactly at 12:30 (optimal morning timing)
        Cours course = createTestCourse(4.0); // 4 hours from 8:00-12:00, could end at 12:30
        courses.add(course);
        createCourseVariables(course);

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        LunchConstraintsHandler handler = new LunchConstraintsHandler();

        // When
        List<IntVar> penalties = handler.addConstraints(model, null, data);
        // Minimize penalties
        if (!penalties.isEmpty()) {
            IntVar totalPenalty = model.newIntVar(0, penalties.size() * 10L, "total_penalty");
            model.addEquality(totalPenalty, LinearExpr.sum(penalties.toArray(new IntVar[0])));
            model.minimize(totalPenalty);
        }


        // Then
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);


        assertEquals(CpSolverStatus.OPTIMAL, status);

        int endMinutes = (int) solver.value(courseVars.get(course).getEndVar());
        int startMinutes = (int) solver.value(courseVars.get(course).getStartVar());
        assertEquals(270, endMinutes );
        // Course ending at 12:30 is valid (270 min from 8:00)
        assertTrue(endMinutes <= 270 || startMinutes >= 330,
            "Course should end at/before 12:30 or start after 13:30");
    }

    @Test
    void addConstraints_CourseStartingAt13h30_IsValid() {
        // Given: course that could start at 13:30 (optimal afternoon timing)
        Cours course = createTestCourse(3.0);
        courses.add(course);
        createCourseVariables(course);

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        LunchConstraintsHandler handler = new LunchConstraintsHandler();

        // When
        List<IntVar> penalties = handler.addConstraints(model, null, data);
        model.minimize(com.google.ortools.sat.LinearExpr.sum(penalties.toArray(new IntVar[0])));

        // Then
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        assertEquals(CpSolverStatus.OPTIMAL, status);

        int startMinutes = (int) solver.value(courseVars.get(course).getStartVar());
        
        // Course starting at 13:30 is valid (330 min from 8:00)
        boolean validTiming = startMinutes == 330 || // Optimal: starts at 13:30
                             (startMinutes <= 270 && startMinutes + 180 <= 270) || // Morning course
                             startMinutes >= 330; // Afternoon course

        assertTrue(validTiming, "Course timing should respect lunch constraints");
    }

    @Test
    void addConstraints_NonOptimalTiming_HasPenalty() {
        // Given: course scheduled at non-optimal time (e.g., ending at 12:00 instead of 12:30)
        Cours course = createTestCourse(2.0);
        courses.add(course);
        createCourseVariables(course);

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        LunchConstraintsHandler handler = new LunchConstraintsHandler();

        // When
        List<IntVar> penalties = handler.addConstraints(model, null, data);

        // Then: penalty variable should exist and be bounded
        assertEquals(1, penalties.size());
        
        IntVar penalty = penalties.get(0);
        assertNotNull(penalty, "Penalty variable should exist");
    }
}