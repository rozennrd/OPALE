package com.opale.micro_planning.infra_json.mappers;

import com.opale.micro_planning.domain.entities.Enseignement;
import com.opale.micro_planning.domain.entities.Matiere;
import com.opale.micro_planning.domain.entities.Professeur;
import com.opale.micro_planning.domain.entities.Promotion;
import com.opale.micro_planning.domain.entities.Salle;
import com.opale.micro_planning.infra.models.TypeProfesseur;
import com.opale.micro_planning.infra.models.TypeSalle;
import com.opale.micro_planning.infra_json.models.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Maps JSON DTOs to domain entities
 * Converts clean JSON DTOs to domain objects used by the application
 */
public class JsonToDomainMapper {

    public static Promotion toDomainPromotion(PromotionJson json) {
        if (json == null) return null;
        return Promotion.builder()
            .id(json.getId())
            .nom(json.getNom())
            .effectifs(json.getEffectifs())
            .build();
    }

    public static Matiere toDomainMatiere(MatiereJson json) {
        return Matiere.builder()
            .id(json.getId())
            .nom(json.getNom())
            .volumeHoraire(json.getVolumeHoraire())
            .promotion(toDomainPromotion(json.getPromotion()))
            .build();
    }

    public static Professeur toDomainProfesseur(ProfesseurJson json) {
        return Professeur.builder()
            .id(json.getId())
            .nom(json.getNom())
            .prenom(json.getPrenom())
            .email(json.getEmail())
            // Note: TypeProfesseur enum conversion would go here if needed
            .build();
    }

    public static Enseignement toDomainEnseignement(EnseignementJson json) {
        return new Enseignement(
            json.getId(),
            toDomainMatiere(json.getMatiere()),
            toDomainProfesseur(json.getProfesseur()),
            json.getNbHeures()
        );
    }

    public static Salle toDomainSalle(SalleJson json) {
        return Salle.builder()
            .id(json.getId())
            .nom(json.getNom())
            // TypeSalle enum conversion would go here if needed
            .capacite(json.getCapacite())
            .etage(json.getEtage())
            .build();
    }

    public static List<Salle> toDomainSalles(List<SalleJson> jsonList) {
        return jsonList.stream()
            .map(JsonToDomainMapper::toDomainSalle)
            .collect(Collectors.toList());
    }

    public static List<Enseignement> toDomainEnseignements(List<EnseignementJson> jsonList) {
        return jsonList.stream()
            .map(JsonToDomainMapper::toDomainEnseignement)
            .collect(Collectors.toList());
    }
}
