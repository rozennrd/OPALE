package com.opale.micro_planning.app.mappers;

import com.opale.micro_planning.domain.entities.Enseignement;
import com.opale.micro_planning.domain.entities.Matiere;
import com.opale.micro_planning.domain.entities.Professeur;
import com.opale.micro_planning.domain.entities.Promotion;
import com.opale.micro_planning.domain.entities.Salle;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Maps infrastructure models to domain entities
 */
public class InfrastructureToDomainMapper {

    public static Salle toDomainSalle(com.opale.micro_planning.infra.models.Salle infraSalle) {
        return Salle.builder()
                .id(infraSalle.getId())
                .nom(infraSalle.getNom())
                .type(infraSalle.getType())
                .capacite(infraSalle.getCapacite())
                .etage(infraSalle.getEtage())
                .build();
    }

    public static Enseignement toDomainEnseignement(com.opale.micro_planning.infra.models.Enseignement infraEnseignement) {
        return new Enseignement(
                infraEnseignement.getId(),
                toDomainMatiere(infraEnseignement.getMatiere()),
                toDomainProfesseur(infraEnseignement.getProfesseur()),
                infraEnseignement.getNbHeures() // Use nbHeures directly
        );
    }

    private static Matiere toDomainMatiere(com.opale.micro_planning.infra.models.Matiere infraMatiere) {
        return Matiere.builder()
                .id(infraMatiere.getId())
                .nom(infraMatiere.getNom())
                .volumeHoraire(infraMatiere.getVolumeHoraire())
                .promotion(infraMatiere.getPromotion() != null ? toDomainPromotion(infraMatiere.getPromotion()) : null)
                .build();
    }

    private static Promotion toDomainPromotion(com.opale.micro_planning.infra.models.Promotion infraPromotion) {
        if (infraPromotion == null) {
            return null;
        }
        return Promotion.builder()
                .id(infraPromotion.getId())
                .nom(infraPromotion.getNom())
                .effectifs(infraPromotion.getEffectifs())
                .build(); // No cycle in domain
    }

    private static Professeur toDomainProfesseur(com.opale.micro_planning.infra.models.Professeur infraProfesseur) {
        return Professeur.builder()
                .id(infraProfesseur.getId())
                .nom(infraProfesseur.getNom())
                .prenom(infraProfesseur.getPrenom())
                .email(infraProfesseur.getEmail())
                .build();
    }

    public static List<Salle> toDomainSalles(List<com.opale.micro_planning.infra.models.Salle> infraSalles) {
        return infraSalles.stream()
                .map(InfrastructureToDomainMapper::toDomainSalle)
                .collect(Collectors.toList());
    }

    public static List<Enseignement> toDomainEnseignements(List<com.opale.micro_planning.infra.models.Enseignement> infraEnseignements) {
        return infraEnseignements.stream()
                .map(InfrastructureToDomainMapper::toDomainEnseignement)
                .collect(Collectors.toList());
    }
}
