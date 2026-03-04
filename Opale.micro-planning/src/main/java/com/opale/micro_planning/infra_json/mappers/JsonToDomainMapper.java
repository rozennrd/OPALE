package com.opale.micro_planning.infra_json.mappers;

import com.opale.micro_planning.domain.entities.Enseignement;
import com.opale.micro_planning.domain.entities.Matiere;
import com.opale.micro_planning.domain.entities.Professeur;
import com.opale.micro_planning.domain.entities.Promotion;
import com.opale.micro_planning.domain.entities.Salle;
import com.opale.micro_planning.infra.models.Cycle;
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
        
        // Create a minimal Cycle object if idCycle is present
        Cycle cycle = null;
        if (json.getIdCycle() != null) {
            cycle = new Cycle();
            cycle.setId(json.getIdCycle());
        }
        
        return Promotion.builder()
            .id(json.getId())
            .nom(json.getNom())
            .effectifs(json.getEffectifs())
            .cycle(cycle)
            .dateStart(json.getDateStart())
            .dateEnd(json.getDateEnd())
            .build();
    }

    public static Matiere toDomainMatiere(MatiereJson json) {
        return Matiere.builder()
            .id(json.getId())
            .nom(json.getNom())
            .volumeHoraire(json.getVolumeHoraire())
            .promotion(toDomainPromotion(json.getPromotion()))
            .semestre(json.getSemestre())
            .nbPartiels(json.getNbPartiels())
            .nbEvalIntermediaire(json.getNbEvalIntermediaire())
            .heuresTd(json.getHeuresTd())
            .heuresTp(json.getHeuresTp())
            .build();
    }

    public static Professeur toDomainProfesseur(ProfesseurJson json) {
        // Convert string type to TypeProfesseur enum
        TypeProfesseur typeProfesseur = null;
        if (json.getType() != null) {
            try {
                typeProfesseur = TypeProfesseur.valueOf(json.getType().toUpperCase());
            } catch (IllegalArgumentException e) {
                // If type doesn't match enum, leave as null
            }
        }
        
        return Professeur.builder()
            .id(json.getId())
            .nom(json.getNom())
            .prenom(json.getPrenom())
            .email(json.getEmail())
            .type(typeProfesseur)
            .modaliteEnseignement(json.getModaliteEnseignement())
            .build();
    }

    public static Enseignement toDomainEnseignement(EnseignementJson json) {
        // Map single nbHeures to heuresTd, other hour types remain null
        return new Enseignement(
            json.getId(),
            toDomainMatiere(json.getMatiere()),
            toDomainProfesseur(json.getProfesseur()),
            json.getNbHeures(),  // heuresTd - default allocation
            null,                // heuresTp
            null,                // heuresProjet
            null,                // heuresElearning
            null                 // heuresAutre
        );
    }

    public static Salle toDomainSalle(SalleJson json) {
        // Convert string type to TypeSalle enum
        TypeSalle typeSalle = null;
        if (json.getType() != null) {
            try {
                typeSalle = TypeSalle.valueOf(json.getType());
            } catch (IllegalArgumentException e) {
                // If type doesn't match enum, leave as null
            }
        }
        
        return Salle.builder()
            .id(json.getId())
            .nom(json.getNom())
            .type(typeSalle)
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
