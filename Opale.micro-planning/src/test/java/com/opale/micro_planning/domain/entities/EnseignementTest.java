package com.opale.micro_planning.domain.entities;

import com.opale.micro_planning.domain.exceptions.NoSatifyingSolutionException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class EnseignementTest {

    private Enseignement enseignement;
    private Matiere matiere;
    private Professeur professeur;

    @BeforeEach
    void setUp() {
        matiere = Matiere.builder()
                .id(UUID.randomUUID())
                .nom("Mathematics")
                .volumeHoraire(30.0)
                .build();

        professeur = Professeur.builder()
                .id(UUID.randomUUID())
                .nom("Dupont")
                .prenom("Jean")
                .email("jean.dupont@test.com")
                .build();

        enseignement = new Enseignement(
                UUID.randomUUID(),
                matiere,
                professeur,
                10, // nbHeures,
                0,
                0,
                0,
                0

        );
    }

    // PRESERVE_DEFAULT_LENGTH Strategy Tests

    @Test
    void breakIntoCourses_PreserveDefaultLength_ExactDivision() {
        // Given: 8 hours with default duration of 4 hours
        Enseignement enseignement8h = new Enseignement(
                UUID.randomUUID(),
                matiere,
                professeur,
                8,
                0,
                0,
                0,
                0
        );

        // When
        ArrayList<Cours> result = enseignement8h.breakIntoCourses(4, EnseignementBreakdownStrategy.PRESERVE_DEFAULT_LENGTH);

        // Then
        assertEquals(2, result.size());
        assertEquals(4.0, result.get(0).getDuration());
        assertEquals(4.0, result.get(1).getDuration());
        assertEquals(matiere, result.get(0).getMatiere());
        assertEquals(professeur, result.get(0).getProf());
        assertEquals(matiere, result.get(1).getMatiere());
        assertEquals(professeur, result.get(1).getProf());
    }

    @Test
    void breakIntoCourses_PreserveDefaultLength_WithRemainder() {
        // Given: 10 hours with default duration of 4 hours → 2 courses of 4h + 1 course of 2h

        // When
        ArrayList<Cours> result = enseignement.breakIntoCourses(4, EnseignementBreakdownStrategy.PRESERVE_DEFAULT_LENGTH);

        // Then
        assertEquals(3, result.size());
        assertEquals(4.0, result.get(0).getDuration());
        assertEquals(4.0, result.get(1).getDuration());
        assertEquals(2.0, result.get(2).getDuration());
    }

    @Test
    void breakIntoCourses_PreserveDefaultLength_SingleCourse() {
        // Given: 4 hours with default duration of 4 hours
        Enseignement enseignement4h = new Enseignement(
                UUID.randomUUID(),
                matiere,
                professeur,
                4,
                0,
                0,
                0,
                0
        );

        // When
        ArrayList<Cours> result = enseignement4h.breakIntoCourses(4, EnseignementBreakdownStrategy.PRESERVE_DEFAULT_LENGTH);

        // Then
        assertEquals(1, result.size());
        assertEquals(4.0, result.get(0).getDuration());
    }

    // EGALIZE_COURSE_DURATION Strategy Tests

    @Test
    void breakIntoCourses_EgalizeCourseDuration_FindsEqualizingDuration() {
        // Given: 10 hours with default duration of 4 hours
        // Should find 2.5 hours (10 / 2.5 = 4 courses)

        // When
        ArrayList<Cours> result = enseignement.breakIntoCourses(4, EnseignementBreakdownStrategy.EGALIZE_COURSE_DURATION);

        // Then
        assertEquals(4, result.size());
        for (Cours cours : result) {
            assertEquals(2.5, cours.getDuration());
            assertEquals(matiere, cours.getMatiere());
            assertEquals(professeur, cours.getProf());
        }
    }



    @Test
    void breakIntoCourses_EgalizeCourseDuration_ExactDivisionAtDefault() {
        // Given: 8 hours with default duration of 4 hours
        // 4.0 divides evenly, so should use 4.0 hours
        Enseignement enseignement8h = new Enseignement(
                UUID.randomUUID(),
                matiere,
                professeur,
                8,
                0,
                0,
                0,
                0
        );

        // When
        ArrayList<Cours> result = enseignement8h.breakIntoCourses(4, EnseignementBreakdownStrategy.EGALIZE_COURSE_DURATION);

        // Then
        assertEquals(2, result.size());
        assertEquals(4.0, result.get(0).getDuration());
        assertEquals(4.0, result.get(1).getDuration());
    }

    // Wrapper Method Tests

    @Test
    void breakIntoCourses_WrapperMethod_UsesPreserveDefaultLength() {
        // Given: 10 hours with default duration of 4 hours

        // When
        ArrayList<Cours> result = enseignement.breakIntoCourses(4);

        // Then: should behave exactly like PRESERVE_DEFAULT_LENGTH
        assertEquals(3, result.size());
        assertEquals(4.0, result.get(0).getDuration());
        assertEquals(4.0, result.get(1).getDuration());
        assertEquals(2.0, result.get(2).getDuration());
    }

    // Error Cases

    @Test
    void breakIntoCourses_NullStrategy_ThrowsException() {
        // When & Then
        NoSatifyingSolutionException exception = assertThrows(
                NoSatifyingSolutionException.class,
                () -> enseignement.breakIntoCourses(4, null)
        );
        assertEquals("No satisfying solution to break down this course, or no strategy selected", exception.getMessage());
    }

    // Edge Cases

    @Test
    void breakIntoCourses_ZeroHours() {
        // Given: 0 hours
        Enseignement enseignement0h = new Enseignement(
                UUID.randomUUID(),
                matiere,
                professeur,
                0,
                0,
                0,
                0,
                0
        );

        // When
        ArrayList<Cours> result = enseignement0h.breakIntoCourses(4, EnseignementBreakdownStrategy.PRESERVE_DEFAULT_LENGTH);

        // Then
        assertEquals(0, result.size());
    }

    @Test
    void breakIntoCourses_VerySmallDuration() {
        // Given: 5 hours, try to find very small durations
        Enseignement enseignement5h = new Enseignement(
                UUID.randomUUID(),
                matiere,
                professeur,
                8,
                0,
                0,
                0,
                0
        );

        // When: EGALIZE should eventually find 1.0 hour (5 courses of 1h)
        ArrayList<Cours> result = enseignement5h.breakIntoCourses(4, EnseignementBreakdownStrategy.EGALIZE_COURSE_DURATION);

        // Then
        assertEquals(2, result.size());
        for (Cours cours : result) {
            assertEquals(4, cours.getDuration());
        }
    }
}
