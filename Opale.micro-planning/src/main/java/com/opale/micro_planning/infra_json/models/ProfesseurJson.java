package com.opale.micro_planning.infra_json.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * JSON DTO for Professeur - clean POJO without JPA annotations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfesseurJson {
    private UUID id;
    private String nom;
    private String prenom;
    private String email;
    private String type; // Will be converted to enum
    private Boolean distancel; // Note: JSON has "distanciel"
}
