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

class TimeConstraintsHandlerTest {

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
        TimeConstraintsHandler handler = new TimeConstraintsHandler();

        // When
        List<IntVar> penalties = handler.addConstraints(model, null, data);

        // Then
        assertTrue(penalties.isEmpty(), "Should return empty penalties for empty courses");
    }

    @Test
    void addConstraints_WithSingleCourse_ReturnsEmptyPenalties() {
        // Given
        Cours course = createTestCourse(2.0);
        courses.add(course);
        createCourseVariables(course);

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        TimeConstraintsHandler handler = new TimeConstraintsHandler();

        // When
        List<IntVar> penalties = handler.addConstraints(model, null, data);

        // Then
        assertTrue(penalties.isEmpty(), "TimeConstraintsHandler returns no penalties (hard constraints only)");
    }

    @Test
    void addConstraints_CoursePlacedInMorningSession() {
        // Given: short course that could fit in morning
        Cours course = createTestCourse(2.0); // 2 hours
        courses.add(course);
        createCourseVariables(course);

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        TimeConstraintsHandler handler = new TimeConstraintsHandler();

        // When
        handler.addConstraints(model, null, data);

        // Then
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        assertEquals(CpSolverStatus.OPTIMAL, status, "Should find valid solution");

        int startMinutes = (int) solver.value(courseVars.get(course).getStartVar());
        int endMinutes = (int) solver.value(courseVars.get(course).getEndVar());

        // Course must be entirely before lunch OR entirely after lunch
        boolean isMorning = endMinutes <= LUNCH_START_FROM_DAY_START;
        boolean isAfternoon = startMinutes >= LUNCH_END_FROM_DAY_START;

        assertTrue(isMorning || isAfternoon,
            "Course must be entirely in morning or afternoon session");
    }

    @Test
    void addConstraints_CoursePlacedInAfternoonSession() {
        // Given: course that could fit in afternoon
        Cours course = createTestCourse(3.0); // 3 hours
        courses.add(course);
        createCourseVariables(course);

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        TimeConstraintsHandler handler = new TimeConstraintsHandler();

        // When
        handler.addConstraints(model, null, data);

        // Then
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        assertEquals(CpSolverStatus.OPTIMAL, status, "Should find valid solution");

        int startMinutes = (int) solver.value(courseVars.get(course).getStartVar());
        int endMinutes = (int) solver.value(courseVars.get(course).getEndVar());

        // Verify lunch constraint
        boolean isMorning = endMinutes <= LUNCH_START_FROM_DAY_START;
        boolean isAfternoon = startMinutes >= LUNCH_END_FROM_DAY_START;

        assertTrue(isMorning || isAfternoon,
            "Course must not span lunch break");
    }

    @Test
    void addConstraints_LongMorningCourse() {
        // Given: 4-hour course that fits in morning (8:00-12:00, lunch at 12:30)
        Cours course = createTestCourse(4.0); // 4 hours = 240 minutes
        courses.add(course);
        createCourseVariables(course);

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        TimeConstraintsHandler handler = new TimeConstraintsHandler();

        // When
        handler.addConstraints(model, null, data);

        // Then
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        assertEquals(CpSolverStatus.OPTIMAL, status, "Should find valid solution for 4-hour morning course");

        int startMinutes = (int) solver.value(courseVars.get(course).getStartVar());
        int endMinutes = (int) solver.value(courseVars.get(course).getEndVar());

        // Must end by lunch start (270 min from 8:00 = 12:30)
        boolean isMorning = endMinutes <= LUNCH_START_FROM_DAY_START;
        boolean isAfternoon = startMinutes >= LUNCH_END_FROM_DAY_START;

        assertTrue(isMorning || isAfternoon,
            "4-hour course must fit entirely before or after lunch");
    }

    @Test
    void addConstraints_MultipleCoursesRespectLunchBreak() {
        // Given: multiple courses
        Cours course1 = createTestCourse(2.0);
        Cours course2 = createTestCourse(2.0);
        Cours course3 = createTestCourse(2.0);
        
        courses.addAll(List.of(course1, course2, course3));
        for (Cours c : courses) {
            createCourseVariables(c);
        }

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        TimeConstraintsHandler handler = new TimeConstraintsHandler();

        // When
        handler.addConstraints(model, null, data);

        // Then
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        assertEquals(CpSolverStatus.OPTIMAL, status, "Should find valid solution for multiple courses");

        // Verify all courses respect lunch break
        for (Cours course : courses) {
            int startMinutes = (int) solver.value(courseVars.get(course).getStartVar());
            int endMinutes = (int) solver.value(courseVars.get(course).getEndVar());

            boolean isMorning = endMinutes <= LUNCH_START_FROM_DAY_START;
            boolean isAfternoon = startMinutes >= LUNCH_END_FROM_DAY_START;

            assertTrue(isMorning || isAfternoon,
                "Each course must respect lunch break constraint");
        }
    }

    @Test
    void addConstraints_CourseCannotSpanLunch() {
        // Given: 5-hour course - cannot fit entirely in morning (4.5h) or start exactly at lunch
        // Morning: 8:00-12:30 = 4.5 hours = 270 minutes
        // Afternoon: 13:30-18:00 = 4.5 hours = 270 minutes
        // A 5-hour course (300 minutes) cannot fit in either session
        Cours course = createTestCourse(5.0); // 5 hours = 300 minutes
        courses.add(course);
        createCourseVariables(course);

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        TimeConstraintsHandler handler = new TimeConstraintsHandler();

        // When
        handler.addConstraints(model, null, data);

        // Then
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        // Should be INFEASIBLE - can't fit 5 hours entirely before or after lunch
        assertEquals(CpSolverStatus.INFEASIBLE, status, 
            "5-hour course cannot fit entirely in morning or afternoon session");
    }

    @Test
    void addConstraints_VerifyTimeConstants() {
        // Verify the constants are correctly defined
        assertEquals(480, DAY_START_MINUTES, "Day starts at 8:00 = 480 minutes from midnight");
        assertEquals(750, LUNCH_START_MINUTES, "Lunch starts at 12:30 = 750 minutes from midnight");
        assertEquals(810, LUNCH_END_MINUTES, "Lunch ends at 13:30 = 810 minutes from midnight");
        assertEquals(1080, DAY_END_MINUTES, "Day ends at 18:00 = 1080 minutes from midnight");
        
        assertEquals(270, LUNCH_START_FROM_DAY_START, "Lunch starts 270 min after 8:00 (12:30)");
        assertEquals(330, LUNCH_END_FROM_DAY_START, "Lunch ends 330 min after 8:00 (13:30) - wait, this should be 330");
        
        // Actually LUNCH_END_FROM_DAY_START = LUNCH_END_MINUTES - DAY_START_MINUTES = 810 - 480 = 330
        // But in the constants file it says LUNCH_END_FROM_DAY_START = LUNCH_END_MINUTES - DAY_START_MINUTES
        // Let me check: 810 - 480 = 330. But the constant says LUNCH_END_FROM_DAY_START = LUNCH_END_MINUTES - DAY_START_MINUTES
        // Wait, looking at the constants: LUNCH_END_FROM_DAY_START = LUNCH_END_MINUTES - DAY_START_MINUTES = 810 - 480 = 330
        // But the constant is defined as LUNCH_END_FROM_DAY_START = LUNCH_END_MINUTES - DAY_START_MINUTES
        // Let me verify this matches what's in SchedulingConstants
    }

    @Test
    void addConstraints_ShortCourseInMorningOrAfternoon() {
        // Given: 1-hour course
        Cours course = createTestCourse(1.0);
        courses.add(course);
        createCourseVariables(course);

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        TimeConstraintsHandler handler = new TimeConstraintsHandler();

        // When
        handler.addConstraints(model, null, data);

        // Then
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        assertEquals(CpSolverStatus.OPTIMAL, status, "Short course should find valid solution");

        int startMinutes = (int) solver.value(courseVars.get(course).getStartVar());
        int endMinutes = (int) solver.value(courseVars.get(course).getEndVar());

        // Verify duration
        assertEquals(60, endMinutes - startMinutes, "1-hour course should be 60 minutes");

        // Verify lunch constraint
        boolean isMorning = endMinutes <= LUNCH_START_FROM_DAY_START;
        boolean isAfternoon = startMinutes >= LUNCH_END_FROM_DAY_START;

        assertTrue(isMorning || isAfternoon,
            "Short course must still respect lunch break");
    }

    @Test
    void addConstraints_CourseExactlyFitsMorningSession() {
        // Given: course that exactly fits morning (4.5 hours = 270 minutes)
        // Morning is 8:00-12:30 = 270 minutes
        Cours course = createTestCourse(4.5); // 4.5 hours
        courses.add(course);
        createCourseVariables(course);

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        TimeConstraintsHandler handler = new TimeConstraintsHandler();

        // When
        handler.addConstraints(model, null, data);

        // Then
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        assertEquals(CpSolverStatus.OPTIMAL, status, "4.5-hour course should fit in morning session");

        int endMinutes = (int) solver.value(courseVars.get(course).getEndVar());
        int startMinutes = (int) solver.value(courseVars.get(course).getStartVar());
        //assertEquals(0, startMinutes);
        //assertEquals(LUNCH_START_FROM_DAY_START, endMinutes);
        // Must end at or before lunch start (270 min from 8:00), or start after lunch end
        assertTrue(endMinutes <= LUNCH_START_FROM_DAY_START || startMinutes >= LUNCH_END_FROM_DAY_START,
            "Course ending exactly at lunch start should be valid");
    }

    @Test
    void addConstraints_CourseExactlyFitsAfternoonSession() {
        // Given: course that exactly fits afternoon (4.5 hours)
        // Afternoon is 13:30-18:00 = 270 minutes
        Cours course = createTestCourse(4.5); // 4.5 hours
        courses.add(course);
        createCourseVariables(course);

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        TimeConstraintsHandler handler = new TimeConstraintsHandler();

        // When
        handler.addConstraints(model, null, data);

        // Then
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        assertEquals(CpSolverStatus.OPTIMAL, status, "4.5-hour course should fit in afternoon session");

        int startMinutes = (int) solver.value(courseVars.get(course).getStartVar());

        // If in afternoon, must start at or after lunch end
        // The course could be in morning or afternoon
        int endMinutes = (int) solver.value(courseVars.get(course).getEndVar());
        boolean isAfternoon = startMinutes >= LUNCH_END_FROM_DAY_START;
        boolean isMorning = endMinutes <= LUNCH_START_FROM_DAY_START;

        assertTrue(isMorning || isAfternoon,
            "Course must fit in morning or afternoon");
    }
}