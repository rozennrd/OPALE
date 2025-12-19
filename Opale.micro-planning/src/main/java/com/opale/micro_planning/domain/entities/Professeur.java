package com.opale.micro_planning.domain.entities;

import com.opale.micro_planning.infra.models.TypeProfesseur;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class Professeur {
    private UUID id;
    private String nom;
    private String prenom;
    private String email;
    private TypeProfesseur type;
    private Boolean distanciel;

    // Converter methods
    public com.opale.micro_planning.infra.models.Professeur toInfra() {
        com.opale.micro_planning.infra.models.Professeur infra = new com.opale.micro_planning.infra.models.Professeur();
        infra.setId(this.id);
        infra.setNom(this.nom);
        infra.setPrenom(this.prenom);
        infra.setEmail(this.email);
        infra.setType(this.type);
        infra.setDistanciel(this.distanciel);
        return infra;
    }

    public static Professeur fromInfra(com.opale.micro_planning.infra.models.Professeur infra) {
        return Professeur.builder()
            .id(infra.getId())
            .nom(infra.getNom())
            .prenom(infra.getPrenom())
            .email(infra.getEmail())
            .type(infra.getType())
            .distanciel(infra.getDistanciel())
            .build();
    }
}
