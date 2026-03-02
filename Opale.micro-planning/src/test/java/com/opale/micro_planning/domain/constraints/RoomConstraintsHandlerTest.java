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

import static org.junit.jupiter.api.Assertions.*;

class RoomConstraintsHandlerTest {

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
        courseVars = new HashMap<>();
        availableDays = List.of(
            LocalDate.of(2024, 1, 8),  // Monday
            LocalDate.of(2024, 1, 9)   // Tuesday
        );
    }

    private List<Salle> createTestRooms(int... capacities) {
        List<Salle> rooms = new ArrayList<>();
        char name = 'A';
        for (int capacity : capacities) {
            rooms.add(Salle.builder()
                .id(UUID.randomUUID())
                .nom("Room " + name)
                .type(TypeSalle.Cours)
                .capacite(capacity)
                .etage(1)
                .build());
            name++;
        }
        return rooms;
    }

    private Cours createTestCourse(UUID profId, UUID promotionId, int studentCount, double duration) {
        Professeur prof = Professeur.builder()
            .id(profId)
            .nom("Prof " + profId.toString().substring(0, 4))
            .email("prof@test.com")
            .build();

        Promotion promotion = Promotion.builder()
            .id(promotionId)
            .nom("Promo " + promotionId.toString().substring(0, 4))
            .effectifs(studentCount)
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

    private void createCourseVariables(Cours course, int numDays, int numRooms) {
        int durationMinutes = (int) course.getDuration() * 60;

        IntVar dayVar = model.newIntVar(0, numDays - 1, "course_" + course.getId() + "_day");
        IntVar startVar = model.newIntVar(0, 600 - durationMinutes, "course_" + course.getId() + "_start");
        IntVar endVar = model.newIntVar(durationMinutes, 600, "course_" + course.getId() + "_end");
        IntVar roomVar = model.newIntVar(0, numRooms - 1, "course_" + course.getId() + "_room");

        // End = start + duration
        model.addEquality(endVar, LinearExpr.sum(new IntVar[]{startVar, model.newConstant(durationMinutes)}));

        courseVars.put(course, new CourseVariables(dayVar, startVar, endVar, roomVar, durationMinutes));
    }

    @Test
    void addConstraints_WithEmptyRooms_ReturnsEmptyPenalties() {
        // Given: course but no rooms
        availableRooms = new ArrayList<>();
        Cours course = createTestCourse(UUID.randomUUID(), UUID.randomUUID(), 20, 2.0);
        courses.add(course);
        createCourseVariables(course, availableDays.size(), 1);

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        RoomConstraintsHandler handler = new RoomConstraintsHandler();

        // When
        List<IntVar> penalties = handler.addConstraints(model, null, data);

        // Then
        assertTrue(penalties.isEmpty(), "Should return empty penalties when no rooms available");
    }

    @Test
    void addConstraints_WithEmptyCourses_ReturnsEmptyPenalties() {
        // Given: rooms but no courses
        availableRooms = createTestRooms(30, 25);

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        RoomConstraintsHandler handler = new RoomConstraintsHandler();

        // When
        List<IntVar> penalties = handler.addConstraints(model, null, data);

        // Then
        assertTrue(penalties.isEmpty(), "Should return empty penalties for empty courses");
    }

    @Test
    void addConstraints_CourseFitsInRoom_FindsSolution() {
        // Given: course with 20 students and room with capacity 30
        availableRooms = createTestRooms(30);
        Cours course = createTestCourse(UUID.randomUUID(), UUID.randomUUID(), 20, 2.0);
        courses.add(course);
        createCourseVariables(course, availableDays.size(), availableRooms.size());

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        RoomConstraintsHandler handler = new RoomConstraintsHandler();

        // When
        handler.addConstraints(model, null, data);

        // Then
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        assertEquals(CpSolverStatus.OPTIMAL, status, "Should find solution when course fits in room");
    }

    @Test
    void addConstraints_CourseTooBigForRoom_HasNoSolution() {
        // Given: course with 40 students but room with capacity 30
        availableRooms = createTestRooms(30);
        Cours course = createTestCourse(UUID.randomUUID(), UUID.randomUUID(), 40, 2.0);
        courses.add(course);
        createCourseVariables(course, availableDays.size(), availableRooms.size());

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        RoomConstraintsHandler handler = new RoomConstraintsHandler();

        // When
        handler.addConstraints(model, null, data);

        // Then
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        assertEquals(CpSolverStatus.INFEASIBLE, status, 
            "Should have no solution when course is too big for the only room");
    }

    @Test
    void addConstraints_CourseSelectsAppropriateRoom() {
        // Given: course with 25 students and rooms with capacities [20, 30, 15]
        availableRooms = createTestRooms(20, 30, 15);
        Cours course = createTestCourse(UUID.randomUUID(), UUID.randomUUID(), 25, 2.0);
        courses.add(course);
        createCourseVariables(course, availableDays.size(), availableRooms.size());

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        RoomConstraintsHandler handler = new RoomConstraintsHandler();

        // When
        handler.addConstraints(model, null, data);

        // Then
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        assertEquals(CpSolverStatus.OPTIMAL, status, "Should find solution with appropriate room");

        int roomIndex = (int) solver.value(courseVars.get(course).getRoomVar());
        Salle assignedRoom = availableRooms.get(roomIndex);

        assertTrue(assignedRoom.getCapacite() >= 25,
            "Assigned room should have sufficient capacity for 25 students");
        // Should be Room B (capacity 30, index 1)
        assertEquals(30, assignedRoom.getCapacite(), "Should select room with exactly 30 capacity");
    }

    @Test
    void addConstraints_ConcurrentCoursesAssignedDifferentRooms() {
        // Given: two courses that could be concurrent, need different rooms
        availableRooms = createTestRooms(30, 30);
        
        Cours course1 = createTestCourse(UUID.randomUUID(), UUID.randomUUID(), 20, 4.0);
        Cours course2 = createTestCourse(UUID.randomUUID(), UUID.randomUUID(), 20, 4.0);
        
        courses.add(course1);
        courses.add(course2);
        
        for (Cours c : courses) {
            createCourseVariables(c, availableDays.size(), availableRooms.size());
        }

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        RoomConstraintsHandler handler = new RoomConstraintsHandler();

        // When
        handler.addConstraints(model, null, data);

        // Then
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        assertEquals(CpSolverStatus.OPTIMAL, status, "Should find solution");

        // If courses are on same day and overlap in time, they must be in different rooms
        int day1 = (int) solver.value(courseVars.get(course1).getDayVar());
        int day2 = (int) solver.value(courseVars.get(course2).getDayVar());
        int start1 = (int) solver.value(courseVars.get(course1).getStartVar());
        int end1 = (int) solver.value(courseVars.get(course1).getEndVar());
        int start2 = (int) solver.value(courseVars.get(course2).getStartVar());
        int end2 = (int) solver.value(courseVars.get(course2).getEndVar());
        int room1 = (int) solver.value(courseVars.get(course1).getRoomVar());
        int room2 = (int) solver.value(courseVars.get(course2).getRoomVar());

        // Check: if same day and time overlap, rooms must differ
        boolean sameDay = day1 == day2;
        boolean timeOverlap = start1 < end2 && start2 < end1;

        if (sameDay && timeOverlap) {
            assertNotEquals(room1, room2, 
                "Concurrent courses must be in different rooms");
        }
    }

    @Test
    void addConstraints_MultipleCoursesSameRoomSequentially() {
        // Given: two courses that can share the same room at different times
        availableRooms = createTestRooms(30);
        
        Cours course1 = createTestCourse(UUID.randomUUID(), UUID.randomUUID(), 20, 2.0);
        Cours course2 = createTestCourse(UUID.randomUUID(), UUID.randomUUID(), 20, 2.0);
        
        courses.add(course1);
        courses.add(course2);
        
        for (Cours c : courses) {
            createCourseVariables(c, availableDays.size(), availableRooms.size());
        }

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        RoomConstraintsHandler handler = new RoomConstraintsHandler();

        // When
        handler.addConstraints(model, null, data);

        // Then
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        assertEquals(CpSolverStatus.OPTIMAL, status, "Should find solution");

        // Both courses should use the only available room
        int room1 = (int) solver.value(courseVars.get(course1).getRoomVar());
        int room2 = (int) solver.value(courseVars.get(course2).getRoomVar());

        assertEquals(room1, room2, "Both courses should use the same room");

        // But they should not overlap in time if on same day
        int day1 = (int) solver.value(courseVars.get(course1).getDayVar());
        int day2 = (int) solver.value(courseVars.get(course2).getDayVar());
        int start1 = (int) solver.value(courseVars.get(course1).getStartVar());
        int end1 = (int) solver.value(courseVars.get(course1).getEndVar());
        int start2 = (int) solver.value(courseVars.get(course2).getStartVar());
        int end2 = (int) solver.value(courseVars.get(course2).getEndVar());

        if (day1 == day2) {
            assertTrue(end1 <= start2 || end2 <= start1,
                "Sequential courses in same room should not overlap");
        }
    }

    @Test
    void addConstraints_MultipleRoomsCapacityConstraints() {
        // Given: courses with different sizes and rooms with different capacities
        availableRooms = createTestRooms(20, 35, 50);
        
        Cours smallCourse = createTestCourse(UUID.randomUUID(), UUID.randomUUID(), 15, 2.0);
        Cours mediumCourse = createTestCourse(UUID.randomUUID(), UUID.randomUUID(), 30, 2.0);
        Cours largeCourse = createTestCourse(UUID.randomUUID(), UUID.randomUUID(), 45, 2.0);
        
        courses.addAll(List.of(smallCourse, mediumCourse, largeCourse));
        
        for (Cours c : courses) {
            createCourseVariables(c, availableDays.size(), availableRooms.size());
        }

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        RoomConstraintsHandler handler = new RoomConstraintsHandler();

        // When
        handler.addConstraints(model, null, data);

        // Then
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        assertEquals(CpSolverStatus.OPTIMAL, status, "Should find solution with appropriate room assignments");

        // Verify each course is assigned to a room with sufficient capacity
        for (Cours course : courses) {
            int roomIndex = (int) solver.value(courseVars.get(course).getRoomVar());
            Salle assignedRoom = availableRooms.get(roomIndex);
            int requiredCapacity = course.getMatiere().getPromotion().getEffectifs();
            
            assertTrue(assignedRoom.getCapacite() >= requiredCapacity,
                String.format("Room capacity %d should be >= required %d", 
                    assignedRoom.getCapacite(), requiredCapacity));
        }
    }

    @Test
    void addConstraints_NoRoomBigEnough_HasNoSolution() {
        // Given: course requiring 100 students but max room capacity is 50
        availableRooms = createTestRooms(30, 50);
        Cours largeCourse = createTestCourse(UUID.randomUUID(), UUID.randomUUID(), 100, 2.0);
        courses.add(largeCourse);
        createCourseVariables(largeCourse, availableDays.size(), availableRooms.size());

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, availableDays, null);
        RoomConstraintsHandler handler = new RoomConstraintsHandler();

        // When
        handler.addConstraints(model, null, data);

        // Then
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        assertEquals(CpSolverStatus.INFEASIBLE, status, 
            "Should have no solution when no room is big enough");
    }

    @Test
    void addConstraints_SingleRoomMultipleCoursesSameDay() {
        // Given: single room, multiple courses on same day
        availableRooms = createTestRooms(30);
        
        Cours course1 = createTestCourse(UUID.randomUUID(), UUID.randomUUID(), 20, 2.0);
        Cours course2 = createTestCourse(UUID.randomUUID(), UUID.randomUUID(), 20, 2.0);
        Cours course3 = createTestCourse(UUID.randomUUID(), UUID.randomUUID(), 20, 2.0);
        
        courses.addAll(List.of(course1, course2, course3));
        
        for (Cours c : courses) {
            createCourseVariables(c, 1, availableRooms.size()); // Force single day
        }

        ConstraintData data = new ConstraintData(courses, availableRooms, courseVars, 
            List.of(LocalDate.of(2024, 1, 8)), null);
        RoomConstraintsHandler handler = new RoomConstraintsHandler();

        // When
        handler.addConstraints(model, null, data);

        // Then
        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);

        // Should still find a solution if courses can fit sequentially
        assertEquals(CpSolverStatus.OPTIMAL, status, "Should find solution with sequential courses");

        // Verify all courses are in the same room but sequential
        int room1 = (int) solver.value(courseVars.get(course1).getRoomVar());
        int room2 = (int) solver.value(courseVars.get(course2).getRoomVar());
        int room3 = (int) solver.value(courseVars.get(course3).getRoomVar());

        assertEquals(room1, room2, "Course 1 and 2 should be in same room");
        assertEquals(room2, room3, "Course 2 and 3 should be in same room");
    }
}