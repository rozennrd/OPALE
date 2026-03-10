package com.opale.micro_planning.domain.entities;

import com.opale.micro_planning.domain.exceptions.NoSatifyingSolutionException;

import java.util.ArrayList;
import java.util.UUID;



public class Enseignement {
    private UUID id;
    private Matiere matiere;
    private Professeur professeur;
    private Integer heuresTd;
    private Integer heuresTp;
    private Integer heuresProjet;
    private Integer heuresElearning;
    private Integer heuresAutre;


    public Enseignement(UUID id, Matiere matiere, Professeur professeur, Integer heuresTd, Integer heuresTp, Integer heuresProjet, Integer heuresElearning, Integer heuresAutre) {
        this.id = id;
        this.matiere = matiere;
        this.professeur = professeur;
        this.heuresTd = heuresTd;
        this.heuresTp = heuresTp;
        this.heuresProjet = heuresProjet;
        this.heuresElearning = heuresElearning;
        this.heuresAutre = heuresAutre;
    }

    public UUID getId() {
        return id;
    }

    public Matiere getMatiere() {
        return matiere;
    }

    public Professeur getProfesseur() {
        return professeur;
    }

    public Integer getHeuresTd() {
        return heuresTd;
    }

    public Integer getHeuresTp() {
        return heuresTp;
    }

    public Integer getHeuresProjet() {
        return heuresProjet;
    }

    public Integer getHeuresElearning() {
        return heuresElearning;
    }

    public Integer getHeuresAutre() {
        return heuresAutre;
    }

    /**
     * Get total hours from all hour types
     */
    public int getTotalHeures() {
        int total = 0;
        if (heuresTd != null) total += heuresTd;
        if (heuresTp != null) total += heuresTp;
        if (heuresProjet != null) total += heuresProjet;
        if (heuresElearning != null) total += heuresElearning;
        if (heuresAutre != null) total += heuresAutre;
        return total;
    }

    public ArrayList<Cours> breakIntoCourses(int defaultDuration, EnseignementBreakdownStrategy strategy) {
        ArrayList<Cours> coursesDurations = new ArrayList<>();
        int nbHeures = getTotalHeures();
        
        switch(strategy){
            case EGALIZE_COURSE_DURATION -> {
                double nbOfCourses;
                // courseLength starts at default duration, then we check for half an hour less course.
                // For a course that is
                for (double courseLength = defaultDuration;
                     courseLength >= 1 ;
                     courseLength = courseLength - 0.5) {
                    if (nbHeures % courseLength == 0) {
                        nbOfCourses = (double) nbHeures / courseLength;
                        for (int i=0; i < nbOfCourses; i++) {
                            coursesDurations.add(Cours.builder()
                                    .matiere(matiere)
                                    .nom(matiere.getNom())
                                    .prof(professeur)
                                    .duration(courseLength).build());
                        }
                        return coursesDurations;
                    }
                }
                // No solution, fallback on the other solution
                return breakIntoCourses(defaultDuration, EnseignementBreakdownStrategy.PRESERVE_DEFAULT_LENGTH);

            }
            case PRESERVE_DEFAULT_LENGTH -> {
                int quotient = nbHeures / defaultDuration;
                int remainder = nbHeures % defaultDuration;

                for (int i=0; i < quotient; i++) {
                    coursesDurations.add(Cours.builder()
                            .matiere(matiere)
                            .prof(professeur)
                            .duration(defaultDuration).build());
                }
                if(remainder > 0) {
                    coursesDurations.add(Cours.builder()
                            .matiere(matiere)
                            .prof(professeur)
                            .duration(remainder).build());
                }

                return coursesDurations;
            }
            case null, default -> {}
        }
        throw new NoSatifyingSolutionException("No satisfying solution to break down this course, or no strategy selected");
    }

    /**
     * Wrapper for breakIntoCourses. The default strategy for breaking into courses is PRESERVE_DEFAULT_LENGTH
     */
    public ArrayList<Cours> breakIntoCourses(int defaultDuration) {
        return breakIntoCourses(defaultDuration, EnseignementBreakdownStrategy.PRESERVE_DEFAULT_LENGTH);
    }
}