package com.opale.micro_planning.domain.entities;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

import java.util.UUID;


@Builder
@Getter
public class Cours   {
    private UUID id;
    private String nom;
    private Integer numSemaine;
    private Professeur prof;
    private Matiere matiere;
    @Setter
    private LocalDateTime start;
    @Setter
    private LocalDateTime end;
    private final Boolean showMacro = false;
    private final Boolean showMicro = true;
    private final Boolean isBlocking = true;
    private final Boolean isExceptional = false;
    private Boolean distanciel = false;

    private double duration; //in hours

    public int getDurationMinutes() {
        return (int) duration * 60;
    }

    public String getProfesseurId() {return this.prof.getId().toString(); }

}
