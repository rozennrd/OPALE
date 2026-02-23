package com.opale.micro_planning.infra_json.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.opale.micro_planning.infra_json.models.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for loading and accessing JSON mock data
 * Completely separate from JPA/database infrastructure
 */
@Service
public class JsonDataService {

    private final ObjectMapper objectMapper;
    private final MockDataJson mockData;

    public JsonDataService(ObjectMapper objectMapper) throws IOException {
        this.objectMapper = objectMapper;
        this.mockData = loadMockData();
    }

    /**
     * Load mock data from JSON file
     */
    private MockDataJson loadMockData() throws IOException {
        ClassPathResource resource = new ClassPathResource("mock_data.json");
        try (InputStream inputStream = resource.getInputStream()) {
            return objectMapper.readValue(inputStream, MockDataJson.class);
        }
    }

    /**
     * Get all promotions
     */
    public List<PromotionJson> getAllPromotions() {
        return mockData.getPromotion();
    }

    /**
     * Get promotion by ID
     */
    public Optional<PromotionJson> getPromotionById(UUID id) {
        return mockData.getPromotion().stream()
            .filter(p -> p.getId().equals(id))
            .findFirst();
    }

    /**
     * Get matieres by promotion ID
     */
    public List<MatiereJson> getMatieresByPromotion(UUID promotionId) {
        return mockData.getMatiere().stream()
            .filter(m -> m.getPromotion() != null && promotionId.equals(m.getPromotion().getId()))
            .collect(Collectors.toList());
    }

    /**
     * Get enseignements by promotion ID
     */
    public List<EnseignementJson> getEnseignementsByPromotion(UUID promotionId) {
        // Get matiere IDs for this promotion
        var matiereIds = getMatieresByPromotion(promotionId).stream()
            .map(m -> m.getId())
            .collect(Collectors.toSet());

        // Filter enseignements by matiere IDs
        return mockData.getEnseignement().stream()
            .filter(e -> e.getMatiere() != null && matiereIds.contains(e.getMatiere().getId()))
            .collect(Collectors.toList());
    }

    /**
     * Get all salles
     */
    public List<SalleJson> getAllSalles() {
        return mockData.getSalle();
    }

    /**
     * Get salle by ID
     */
    public Optional<SalleJson> getSalleById(UUID id) {
        return mockData.getSalle().stream()
            .filter(s -> s.getId().equals(id))
            .findFirst();
    }
}
