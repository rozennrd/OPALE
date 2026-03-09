package com.opale.micro_planning.infra_json.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * JSON DTO for Enseignement - clean POJO without JPA annotations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnseignementJson {
    private UUID id;
    private MatiereJson matiere;    // Nested object (not flat ID)
    private ProfesseurJson professeur; // Nested object (not flat ID)
    
    @JsonProperty("nb_heures")
    private Integer nbHeures;       // camelCase
}
