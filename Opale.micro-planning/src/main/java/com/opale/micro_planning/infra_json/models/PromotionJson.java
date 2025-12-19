package com.opale.micro_planning.infra_json.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * JSON DTO for Promotion - clean POJO without JPA annotations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionJson {
    private UUID id;
    private String nom;
    private Integer effectifs;
    private UUID idCycle;        // Flat ID reference (not nested object)
    private LocalDate dateStart; // camelCase - Jackson can handle this
    private LocalDate dateEnd;
}
