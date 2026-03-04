package com.opale.micro_planning.infra_json.models;

import com.opale.micro_planning.infra.models.ModaliteEnseignement;
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
    private ModaliteEnseignement modaliteEnseignement; // Note: JSON has "distanciel"
}
