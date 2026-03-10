package com.opale.micro_planning.infra_json.models;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    
    @JsonProperty("id_cycle")
    private UUID idCycle;        // Flat ID reference (not nested object)
    
    @JsonProperty("date_start")
    private LocalDate dateStart;
    
    @JsonProperty("date_end")
    private LocalDate dateEnd;
}
