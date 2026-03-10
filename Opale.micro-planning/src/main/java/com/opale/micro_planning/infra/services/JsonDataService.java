package com.opale.micro_planning.infra.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.opale.micro_planning.infra.models.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for reading mock data from JSON file instead of database
 * Provides data access methods similar to repository interfaces
 */
@Service
public class JsonDataService {

    private final ObjectMapper objectMapper;
    private final MockData mockData;

    public JsonDataService(ObjectMapper objectMapper) throws IOException {
        this.objectMapper = objectMapper;
        this.mockData = loadMockData();
    }

    /**
     * Load mock data from JSON file
     */
    private MockData loadMockData() throws IOException {
        ClassPathResource resource = new ClassPathResource("mock_data.json");
        try (InputStream inputStream = resource.getInputStream()) {
            return objectMapper.readValue(inputStream, MockData.class);
        }
    }

    /**
     * Get promotion by ID
     */
    public Optional<com.opale.micro_planning.infra.models.Promotion> getPromotionById(UUID id) {
        return mockData.getPromotion().stream()
            .filter(p -> p.getId().equals(id))
            .findFirst();
    }

    /**
     * Get all promotions
     */
    public List<com.opale.micro_planning.infra.models.Promotion> getAllPromotions() {
        return mockData.getPromotion();
    }

    /**
     * Get matieres by promotion ID
     */
    public List<com.opale.micro_planning.infra.models.Matiere> getMatieresByPromotion(UUID promotionId) {
        return mockData.getMatiere().stream()
            .filter(m -> promotionId.equals(m.getPromotion() != null ? m.getPromotion().getId() : null))
            .collect(Collectors.toList());
    }

    /**
     * Get all matieres
     */
    public List<com.opale.micro_planning.infra.models.Matiere> getAllMatieres() {
        return mockData.getMatiere();
    }

    /**
     * Get all professeurs
     */
    public List<Professeur> getAllProfesseurs() {
        return mockData.getProfesseur();
    }

    /**
     * Get professeur by ID
     */
    public Optional<Professeur> getProfesseurById(UUID id) {
        return mockData.getProfesseur().stream()
            .filter(p -> p.getId().equals(id))
            .findFirst();
    }

    /**
     * Get all salles
     */
    public List<Salle> getAllSalles() {
        return mockData.getSalle();
    }

    /**
     * Get salle by ID
     */
    public Optional<Salle> getSalleById(UUID id) {
        return mockData.getSalle().stream()
            .filter(s -> s.getId().equals(id))
            .findFirst();
    }

    /**
     * Get enseignements by promotion ID
     */
    public List<com.opale.micro_planning.infra.models.Enseignement> getEnseignementsByPromotion(UUID promotionId) {
        // Get matiere IDs for this promotion
        Set<String> matiereIds = getMatieresByPromotion(promotionId).stream()
            .map(m -> m.getId().toString())
            .collect(Collectors.toSet());

        // Filter enseignements by matiere IDs
        return mockData.getEnseignement().stream()
            .filter(e -> matiereIds.contains(e.getMatiere() != null ? e.getMatiere().getId().toString() : null))
            .collect(Collectors.toList());
    }

    /**
     * Get enseignement by matiere and professeur
     */
    public Optional<com.opale.micro_planning.infra.models.Enseignement> getEnseignementByMatiereAndProf(UUID matiereId, UUID profId) {
        return mockData.getEnseignement().stream()
            .filter(e -> matiereId.equals(e.getMatiere() != null ? e.getMatiere().getId() : null) &&
                        profId.equals(e.getProfesseur() != null ? e.getProfesseur().getId() : null))
            .findFirst();
    }

    /**
     * Get all events
     */
    public List<Event> getAllEvents() {
        return mockData.getEvent();
    }

    /**
     * Get events by salle ID
     */
    public List<Event> getEventsBySalle(UUID salleId) {
        // Get event IDs linked to this salle via localisation
        Set<String> eventIds = mockData.getLocalisation().stream()
            .filter(l -> salleId.equals(l.getSalle() != null ? l.getSalle().getId() : null))
            .map(l -> l.getEvent() != null ? l.getEvent().getId().toString() : null)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

        return mockData.getEvent().stream()
            .filter(e -> eventIds.contains(e.getId().toString()))
            .collect(Collectors.toList());
    }

    /**
     * Get cycle by ID
     */
    public Optional<Cycle> getCycleById(UUID id) {
        return mockData.getCycle().stream()
            .filter(c -> c.getId().equals(id))
            .findFirst();
    }

    /**
     * Get all cycles
     */
    public List<Cycle> getAllCycles() {
        return mockData.getCycle();
    }

    /**
     * Get matiere by ID
     */
    public Optional<com.opale.micro_planning.infra.models.Matiere> getMatiereById(UUID id) {
        return mockData.getMatiere().stream()
            .filter(m -> m.getId().equals(id))
            .findFirst();
    }

    /**
     * Get enseignement by ID
     */
    public Optional<com.opale.micro_planning.infra.models.Enseignement> getEnseignementById(UUID id) {
        return mockData.getEnseignement().stream()
            .filter(e -> e.getId().equals(id))
            .findFirst();
    }

    // DTO classes for JSON structure
    public static class MockData {
        private List<Cycle> cycle = new ArrayList<>();
        private List<com.opale.micro_planning.infra.models.Promotion> promotion = new ArrayList<>();
        private List<Professeur> professeur = new ArrayList<>();
        private List<com.opale.micro_planning.infra.models.Matiere> matiere = new ArrayList<>();
        private List<com.opale.micro_planning.infra.models.Enseignement> enseignement = new ArrayList<>();
        private List<Salle> salle = new ArrayList<>();
        private List<Event> event = new ArrayList<>();
        private List<Localisation> localisation = new ArrayList<>();

        // Getters and setters
        public List<Cycle> getCycle() { return cycle; }
        public void setCycle(List<Cycle> cycle) { this.cycle = cycle; }

        public List<com.opale.micro_planning.infra.models.Promotion> getPromotion() { return promotion; }
        public void setPromotion(List<com.opale.micro_planning.infra.models.Promotion> promotion) { this.promotion = promotion; }

        public List<Professeur> getProfesseur() { return professeur; }
        public void setProfesseur(List<Professeur> professeur) { this.professeur = professeur; }

        public List<com.opale.micro_planning.infra.models.Matiere> getMatiere() { return matiere; }
        public void setMatiere(List<com.opale.micro_planning.infra.models.Matiere> matiere) { this.matiere = matiere; }

        public List<com.opale.micro_planning.infra.models.Enseignement> getEnseignement() { return enseignement; }
        public void setEnseignement(List<com.opale.micro_planning.infra.models.Enseignement> enseignement) { this.enseignement = enseignement; }

        public List<Salle> getSalle() { return salle; }
        public void setSalle(List<Salle> salle) { this.salle = salle; }

        public List<Event> getEvent() { return event; }
        public void setEvent(List<Event> event) { this.event = event; }

        public List<Localisation> getLocalisation() { return localisation; }
        public void setLocalisation(List<Localisation> localisation) { this.localisation = localisation; }
    }

    public static class Localisation {
        private String id;
        private String id_salle;
        private String id_event;
        private Salle salle;
        private Event event;

        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getId_salle() { return id_salle; }
        public void setId_salle(String id_salle) { this.id_salle = id_salle; }

        public String getId_event() { return id_event; }
        public void setId_event(String id_event) { this.id_event = id_event; }

        public Salle getSalle() { return salle; }
        public void setSalle(Salle salle) { this.salle = salle; }

        public Event getEvent() { return event; }
        public void setEvent(Event event) { this.event = event; }
    }
}
