package com.opale.micro_planning.infra_json.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * JSON DTO for Matiere - clean POJO without JPA annotations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatiereJson {
    private UUID id;
    private String nom;
    
    @JsonProperty("volume_horaire")
    private Double volumeHoraire;
    
    private PromotionJson promotion; // Nested object (unlike flat ID in enseignement)
    private Integer semestre;
    
    @JsonProperty("nb_partiels")
    private Integer nbPartiels;
    
    @JsonProperty("nb_eval_intermediaire")
    private Integer nbEvalIntermediaire;
    
    @JsonProperty("heures_td")
    private Integer heuresTd;
    
    @JsonProperty("heures_tp")
    private Integer heuresTp;
}
