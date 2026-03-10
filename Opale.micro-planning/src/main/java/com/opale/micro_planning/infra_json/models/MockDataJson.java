package com.opale.micro_planning.infra_json.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Container for all JSON mock data - clean POJO without JPA annotations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MockDataJson {
    private List<CycleJson> cycle = new ArrayList<>();
    private List<PromotionJson> promotion = new ArrayList<>();
    private List<ProfesseurJson> professeur = new ArrayList<>();
    private List<MatiereJson> matiere = new ArrayList<>();
    private List<EnseignementJson> enseignement = new ArrayList<>();
    private List<SalleJson> salle = new ArrayList<>();
    private List<EventJson> event = new ArrayList<>();
}
