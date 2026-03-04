package com.opale.micro_planning.domain.constraints;

import com.google.ortools.Loader;
import com.google.ortools.sat.*;
import com.opale.micro_planning.domain.Scheduler;
import com.opale.micro_planning.domain.entities.*;
import com.opale.micro_planning.infra.models.TypeSalle;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class HumanConstraintsHandlerTest {

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
                .build(),
            Salle.builder()
                .id(UUID.randomUUID())
                .nom("Room B")
                .type(TypeSalle.Cours)
                .capacite(30)
                .etage(1)
                .build()
        );
    }

    private Cours createTestCourse(UUID profId, UUID promotionId, double duration) {
        Professeur prof = Professeur.builder()
            .id(profId)
            .nom("Prof " + profId.toString().substring(0, 4))
            .email("prof@test.com")
            .build();

        Promotion promotion = Promotion.builder()
            .id(promotionId)
            .nom("Promo " + promotionId.toString().substring(0, 4))
            .effectifs(20)
            .build();

        Matiere matiere = Matiere.builder()
            .id(UUID.randomUUID())
            .nom("Subject")
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
        int durationMinutes = (int) (course.getDuration() * 60);
        int numDays = availableDays.size();
        int numRooms = availableRooms.size();

        IntVar dayVar = model.newIntVar(0, numDays - 1, "course_" + course.getId() + "_day");
        IntVar startVar = model.newIntVar(0, 600 - durationMinutes, "course_" + course.getId() + "_start");
        IntVar endVar = model.newIntVar(durationMinutes, 600, "course_" + course.getId() + "_end");
        IntVar roomVar = model.newIntVar(0, numRooms - 1, "course_" + course.getId() + "_room");

        // End = start + duration
        model.addEquality(endVar, LinearExpr.sum(new IntVar[]{startVar, model.newConstant(durationMinutes)}));

        courseVars.put(course, new CourseVariables(dayVar, startVar, endVar, roomVar, durationMinutes));
    }

    @Test
    void addConstraints_WithEmptyCourses_ReturnsEmptyPenalties() {
        // Given: empty course list
        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        HumanConstraintsHandler handler = new HumanConstraintsHandler();

        // When
        List<IntVar> penalties = handler.addConstraints(model, null, data);

        // Then
        assertTrue(penalties.isEmpty(), "Should return empty penalties for empty courses");
    }

    @Test
    void addConstraints_WithSingleCourse_ReturnsEmptyPenalties() {
        // Given: single course
        Cours course = createTestCourse(UUID.randomUUID(), UUID.randomUUID(), 2.0);
        courses.add(course);
        createCourseVariables(course);

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        HumanConstraintsHandler handler = new HumanConstraintsHandler();

        // When
        List<IntVar> penalties = handler.addConstraints(model, null, data);

        // Then
        assertTrue(penalties.isEmpty(), "Single course has no conflicts, should return empty penalties");
    }

    @Test
    void addConstraints_PreventsSameProfessorDoubleBooking() {
        // Given: two courses with same professor
        UUID profId = UUID.randomUUID();
        Cours course1 = createTestCourse(profId, UUID.randomUUID(), 2.0);
        Cours course2 = createTestCourse(profId, UUID.randomUUID(), 2.0);

        courses.add(course1);
        courses.add(course2);
        createCourseVariables(course1);
        createCourseVariables(course2);

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        HumanConstraintsHandler handler = new HumanConstraintsHandler();

        // When
        handler.addConstraints(model, null, data);

        // Then: solver should find a solution where courses don't overlap
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        assertEquals(CpSolverStatus.OPTIMAL, status, "Should find valid solution with separated times");

        // Verify the two courses are not at the same time
        int day1 = (int) solver.value(courseVars.get(course1).getDayVar());
        int day2 = (int) solver.value(courseVars.get(course2).getDayVar());
        int start1 = (int) solver.value(courseVars.get(course1).getStartVar());
        int end1 = (int) solver.value(courseVars.get(course1).getEndVar());
        int start2 = (int) solver.value(courseVars.get(course2).getStartVar());
        int end2 = (int) solver.value(courseVars.get(course2).getEndVar());

        // Either different days, or if same day, no time overlap
        if (day1 == day2) {
            assertTrue(end1 <= start2 || end2 <= start1,
                "Courses with same professor should not overlap in time on the same day");
        }
    }

    @Test
    void addConstraints_PreventsSamePromotionDoubleBooking() {
        // Given: two courses with same promotion but different professors
        UUID promotionId = UUID.randomUUID();
        Cours course1 = createTestCourse(UUID.randomUUID(), promotionId, 2.0);
        Cours course2 = createTestCourse(UUID.randomUUID(), promotionId, 2.0);

        courses.add(course1);
        courses.add(course2);
        createCourseVariables(course1);
        createCourseVariables(course2);

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        HumanConstraintsHandler handler = new HumanConstraintsHandler();

        // When
        handler.addConstraints(model, null, data);

        // Then: solver should find a solution where courses don't overlap
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        assertEquals(CpSolverStatus.OPTIMAL, status, "Should find valid solution");

        // Verify the two courses are not at the same time for same promotion
        int day1 = (int) solver.value(courseVars.get(course1).getDayVar());
        int day2 = (int) solver.value(courseVars.get(course2).getDayVar());
        int start1 = (int) solver.value(courseVars.get(course1).getStartVar());
        int end1 = (int) solver.value(courseVars.get(course1).getEndVar());
        int start2 = (int) solver.value(courseVars.get(course2).getStartVar());
        int end2 = (int) solver.value(courseVars.get(course2).getEndVar());

        if (day1 == day2) {
            assertTrue(end1 <= start2 || end2 <= start1,
                "Courses for same promotion should not overlap in time");
        }
    }

    @Test
    void addConstraints_AllowsSameProfessorDifferentPromotionsDifferentTimes() {
        // Given: same professor teaching different promotions at different times
        UUID profId = UUID.randomUUID();
        Cours course1 = createTestCourse(profId, UUID.randomUUID(), 2.0);
        Cours course2 = createTestCourse(profId, UUID.randomUUID(), 2.0);

        courses.add(course1);
        courses.add(course2);
        createCourseVariables(course1);
        createCourseVariables(course2);

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        HumanConstraintsHandler handler = new HumanConstraintsHandler();

        // When
        handler.addConstraints(model, null, data);

        // Then: should still find a solution (professor constraint only affects time, not feasibility)
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        assertEquals(CpSolverStatus.OPTIMAL, status, "Should find valid solution with different times");
    }

    @Test
    void addConstraints_HandlesMultipleProfessorsAndPromotions() {
        // Given: complex scenario with multiple professors and promotions
        UUID prof1 = UUID.randomUUID();
        UUID prof2 = UUID.randomUUID();
        UUID promo1 = UUID.randomUUID();
        UUID promo2 = UUID.randomUUID();

        Cours course1 = createTestCourse(prof1, promo1, 2.0); // Prof 1, Promo 1
        Cours course2 = createTestCourse(prof2, promo2, 2.0); // Prof 2, Promo 2
        Cours course3 = createTestCourse(prof1, promo2, 2.0); // Prof 1, Promo 2 (same prof as course1)
        Cours course4 = createTestCourse(prof2, promo1, 2.0); // Prof 2, Promo 1 (same prof as course2)

        courses.addAll(List.of(course1, course2, course3, course4));
        for (Cours c : courses) {
            createCourseVariables(c);
        }

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        HumanConstraintsHandler handler = new HumanConstraintsHandler();

        // When
        handler.addConstraints(model, null, data);

        // Then
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        // Should find a solution with all constraints satisfied
        assertEquals(CpSolverStatus.OPTIMAL, status, "Should find valid solution for complex scenario");
    }

    @Test
    void addConstraints_AllowsConcurrentCoursesWithDifferentProfessorsAndPromotions() {
        // Given: two courses with different professors AND different promotions
        Cours course1 = createTestCourse(UUID.randomUUID(), UUID.randomUUID(), 2.0);
        Cours course2 = createTestCourse(UUID.randomUUID(), UUID.randomUUID(), 2.0);

        courses.add(course1);
        courses.add(course2);
        createCourseVariables(course1);
        createCourseVariables(course2);

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        HumanConstraintsHandler handler = new HumanConstraintsHandler();

        // When
        handler.addConstraints(model, null, data);

        // Then: they CAN be scheduled at the same time (but room constraints might prevent it)
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        assertEquals(CpSolverStatus.OPTIMAL, status, "Should find valid solution");
    }
}