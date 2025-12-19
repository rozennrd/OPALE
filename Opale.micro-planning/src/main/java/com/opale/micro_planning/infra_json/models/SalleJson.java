package com.opale.micro_planning.infra_json.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * JSON DTO for Salle - clean POJO without JPA annotations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalleJson {
    private UUID id;
    private String nom;
    private String type; // Will be converted to enum
    private Integer capacite;
    private Integer etage;
}
