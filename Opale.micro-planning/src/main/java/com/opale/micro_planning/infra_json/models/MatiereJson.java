package com.opale.micro_planning.infra_json.models;

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
    private Double volumeHoraire; // camelCase
    private PromotionJson promotion; // Nested object (unlike flat ID in enseignement)
    private Integer semestre;
    private Integer nbPartiels;
    private Integer nbEvalIntermediaire;
    private Integer heuresTd;
    private Integer heuresTp;
}
