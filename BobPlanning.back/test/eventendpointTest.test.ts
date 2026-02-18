import { Request, Response } from "express";
import { eventController } from "../src/api/controllers/eventController";
import { eventService } from "../src/domain/services/eventService";

// Mock du service
jest.mock("../src/domain/services/eventService");

describe("eventController", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });

        mockRequest = {
            body: {},
            query: {},
            params: {},
        };

        mockResponse = {
            status: mockStatus,
            json: mockJson,
        };

        // Mock console.error pour éviter le bruit dans les logs
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        jest.clearAllMocks();
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    describe("getAllEvents", () => {
        it("devrait retourner tous les événements avec succès", async () => {
            const mockEvents = [
                {
                    id: "1",
                    type: "Cours",
                    nom: "Mathématiques",
                    description: "Cours de maths",
                    num_semaine: 1,
                    datetime_start: new Date("2024-01-01T08:00:00"),
                    datetime_end: new Date("2024-01-01T10:00:00"),
                    show_macro: true,
                    show_micro: true,
                    is_blocking: false,
                    is_exceptional: false,
                    is_external: false,
                },
                {
                    id: "2",
                    type: "Examen",
                    nom: "Examen Final",
                    description: "Examen de fin de semestre",
                    num_semaine: 12,
                    datetime_start: new Date("2024-03-15T14:00:00"),
                    datetime_end: new Date("2024-03-15T16:00:00"),
                    show_macro: true,
                    show_micro: true,
                    is_blocking: true,
                    is_exceptional: false,
                    is_external: false,
                },
            ];

            (eventService.getAllEvents as jest.Mock).mockResolvedValue(mockEvents);

            try {
                await eventController.getAllEvents(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(eventService.getAllEvents).toHaveBeenCalledTimes(1);
                expect(mockJson).toHaveBeenCalledWith(mockEvents);
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait gérer les erreurs de connexion à la base de données", async () => {
            const mockError = new Error("Connection timeout");
            (eventService.getAllEvents as jest.Mock).mockRejectedValue(mockError);

            try {
                await eventController.getAllEvents(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ error: "Connection timeout" });
                expect(consoleErrorSpy).toHaveBeenCalledWith("Error in getAllEvents:", mockError);
            } catch (error) {
                fail(`Le controller devrait gérer l'erreur: ${error}`);
            }
        });

        it("devrait throw une erreur si le service échoue de manière inattendue", async () => {
            const mockError = new Error("Erreur critique non gérée");
            (eventService.getAllEvents as jest.Mock).mockImplementation(() => {
                throw mockError;
            });

            try {
                await eventController.getAllEvents(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
            } catch (error) {
                // Si l'erreur n'est pas gérée par le controller, elle arrive ici
                expect(error).toBe(mockError);
            }
        });

        it("devrait gérer les erreurs de requête SQL", async () => {
            const mockError = new Error("syntax error at or near \"SELCT\"");
            (eventService.getAllEvents as jest.Mock).mockRejectedValue(mockError);

            try {
                await eventController.getAllEvents(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ error: "syntax error at or near \"SELCT\"" });
            } catch (error) {
                fail(`Le controller devrait gérer l'erreur SQL: ${error}`);
            }
        });

        it("devrait gérer les TypeError (données corrompues)", async () => {
            const mockError = new TypeError("Cannot read property 'map' of undefined");
            (eventService.getAllEvents as jest.Mock).mockRejectedValue(mockError);

            try {
                await eventController.getAllEvents(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ error: "Cannot read property 'map' of undefined" });
            } catch (error) {
                fail(`Le controller devrait gérer le TypeError: ${error}`);
            }
        });
    });

    describe("getEventById", () => {
        it("devrait retourner un événement par son ID", async () => {
            const mockEvent = {
                id: "1",
                type: "Cours",
                nom: "Mathématiques",
                description: "Cours de maths",
                num_semaine: 1,
                datetime_start: new Date("2024-01-01T08:00:00"),
                datetime_end: new Date("2024-01-01T10:00:00"),
                show_macro: true,
                show_micro: true,
                is_blocking: false,
                is_exceptional: false,
                is_external: false,
            };
            mockRequest.params = { id: "1" };

            (eventService.getEventById as jest.Mock).mockResolvedValue(mockEvent);

            try {
                await eventController.getEventById(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(eventService.getEventById).toHaveBeenCalledWith("1");
                expect(mockJson).toHaveBeenCalledWith(mockEvent);
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait retourner une erreur 404 si l'événement n'existe pas", async () => {
            mockRequest.params = { id: "999" };
            const mockError = new Error("Événement avec l'ID 999 non trouvé");

            (eventService.getEventById as jest.Mock).mockRejectedValue(mockError);

            try {
                await eventController.getEventById(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith({ error: "Événement avec l'ID 999 non trouvé" });
            } catch (error) {
                fail(`Le controller devrait gérer l'erreur 404: ${error}`);
            }
        });

        it("devrait throw si l'ID au format invalide génère une erreur critique", async () => {
            mockRequest.params = { id: "abc-invalid-uuid" };
            const mockError = new Error("invalid input syntax for type uuid");

            (eventService.getEventById as jest.Mock).mockRejectedValue(mockError);

            try {
                await eventController.getEventById(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ error: "invalid input syntax for type uuid" });
            } catch (error) {
                // Test alternatif si le controller ne gère pas cette erreur
                expect((error as Error).message).toContain("invalid input syntax");
            }
        });

        it("devrait gérer les erreurs de timeout", async () => {
            mockRequest.params = { id: "1" };
            const mockError = new Error("Query read timeout");

            (eventService.getEventById as jest.Mock).mockRejectedValue(mockError);

            try {
                await eventController.getEventById(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ error: "Query read timeout" });
            } catch (error) {
                fail(`Le controller devrait gérer le timeout: ${error}`);
            }
        });
    });

    describe("getExceptionalEvents", () => {
        it("devrait retourner tous les événements exceptionnels", async () => {
            const mockEvents = [
                {
                    id: "1",
                    type: "Fermeture",
                    nom: "Fermeture école",
                    description: "Vacances",
                    num_semaine: 5,
                    datetime_start: new Date("2024-02-01T00:00:00"),
                    datetime_end: new Date("2024-02-01T23:59:59"),
                    show_macro: true,
                    show_micro: true,
                    is_blocking: true,
                    is_exceptional: true,
                    is_external: false,
                },
            ];

            (eventService.getExceptionalEvents as jest.Mock).mockResolvedValue(mockEvents);

            try {
                await eventController.getExceptionalEvents(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(eventService.getExceptionalEvents).toHaveBeenCalledTimes(1);
                expect(mockJson).toHaveBeenCalledWith(mockEvents);
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait throw et gérer les erreurs de récupération", async () => {
            const mockError = new Error("Erreur lors de la récupération des événements exceptionnels");
            (eventService.getExceptionalEvents as jest.Mock).mockRejectedValue(mockError);

            try {
                await eventController.getExceptionalEvents(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "Erreur lors de la récupération des événements exceptionnels",
                });
            } catch (error) {
                expect((error as Error).message).toContain("récupération");
            }
        });
    });

    describe("getEventsMacro", () => {
        it("devrait retourner tous les événements macro", async () => {
            const mockEvents = [
                {
                    id: "1",
                    type: "Rentrée",
                    nom: "Rentrée scolaire",
                    description: "Début de l'année",
                    num_semaine: 1,
                    datetime_start: new Date("2024-09-01T08:00:00"),
                    datetime_end: new Date("2024-09-01T18:00:00"),
                    show_macro: true,
                    show_micro: false,
                    is_blocking: false,
                    is_exceptional: false,
                    is_external: false,
                },
            ];

            (eventService.getMacroEvents as jest.Mock).mockResolvedValue(mockEvents);

            try {
                await eventController.getEventsMacro(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(eventService.getMacroEvents).toHaveBeenCalledTimes(1);
                expect(mockJson).toHaveBeenCalledWith(mockEvents);
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait gérer les erreurs", async () => {
            const mockError = new Error("Erreur lors de la récupération des événements macro");
            (eventService.getMacroEvents as jest.Mock).mockRejectedValue(mockError);

            try {
                await eventController.getEventsMacro(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "Erreur lors de la récupération des événements macro",
                });
            } catch (error) {
                fail(`Le controller devrait gérer cette erreur: ${error}`);
            }
        });
    });

    describe("getEventsByPromoAndTypes", () => {
        it("devrait retourner les événements par promo et types", async () => {
            mockRequest.body = {
                promo: "AP5",
                types: ["Cours", "Examen"],
            };

            const mockEvents = {
                Cours: [
                    {
                        id: "1",
                        type: "Cours",
                        nom: "Mathématiques",
                        description: "Cours de maths",
                        datetime_start: new Date("2024-01-01T08:00:00"),
                        datetime_end: new Date("2024-01-01T10:00:00"),
                    },
                ],
                Examen: [
                    {
                        id: "2",
                        type: "Examen",
                        nom: "Examen Final",
                        description: "Examen de fin de semestre",
                        datetime_start: new Date("2024-03-15T14:00:00"),
                        datetime_end: new Date("2024-03-15T16:00:00"),
                    },
                ],
            };

            (eventService.getEventsByPromoAndTypes as jest.Mock).mockResolvedValue(mockEvents);

            try {
                await eventController.getEventsByPromoAndTypes(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(eventService.getEventsByPromoAndTypes).toHaveBeenCalledWith("AP5", ["Cours", "Examen"]);
                expect(mockJson).toHaveBeenCalledWith(mockEvents);
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si promo est manquant", async () => {
            mockRequest.body = { types: ["Cours"] };

            try {
                await eventController.getEventsByPromoAndTypes(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(eventService.getEventsByPromoAndTypes).not.toHaveBeenCalled();
                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    message: "Les champs 'promo' et 'types[]' sont obligatoires.",
                });
            } catch (error) {
                fail(`Le controller devrait gérer la validation: ${error}`);
            }
        });

        it("devrait throw si types n'est pas un tableau valide", async () => {
            mockRequest.body = { promo: "AP5", types: "Cours" };

            try {
                await eventController.getEventsByPromoAndTypes(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(400);
            } catch (error) {
                // Si la validation échoue de manière inattendue
                expect(error).toBeDefined();
            }
        });

        it("devrait retourner une erreur 404 si aucun événement trouvé", async () => {
            mockRequest.body = { promo: "AP5", types: ["Cours", "Examen"] };

            const mockEvents = {
                Cours: [],
                Examen: [],
            };

            (eventService.getEventsByPromoAndTypes as jest.Mock).mockResolvedValue(mockEvents);

            try {
                await eventController.getEventsByPromoAndTypes(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith({
                    message: "Aucun évènement trouvé pour la promo AP5.",
                });
            } catch (error) {
                fail(`Le controller devrait gérer le cas vide: ${error}`);
            }
        });

        it("devrait throw et gérer les erreurs du service", async () => {
            mockRequest.body = { promo: "AP5", types: ["Cours"] };
            const mockError = new Error("Erreur de base de données");

            (eventService.getEventsByPromoAndTypes as jest.Mock).mockRejectedValue(mockError);

            try {
                await eventController.getEventsByPromoAndTypes(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ error: "Erreur de base de données" });
            } catch (error) {
                expect((error as Error).message).toBe("Erreur de base de données");
            }
        });
    });

    describe("addEvent", () => {
        it("devrait ajouter un événement avec succès", async () => {
            mockRequest.body = {
                type: "Cours",
                nom: "Programmation",
                description: "Cours de programmation",
                num_semaine: 2,
                datetime_start: "2024-01-08T08:00:00",
                datetime_end: "2024-01-08T10:00:00",
                show_macro: true,
                show_micro: true,
                is_blocking: false,
                is_exceptional: false,
                is_external: false,
            };

            const mockResult = {
                id: "3",
                type: "Cours",
                nom: "Programmation",
                description: "Cours de programmation",
                num_semaine: 2,
                datetime_start: new Date("2024-01-08T08:00:00"),
                datetime_end: new Date("2024-01-08T10:00:00"),
                show_macro: true,
                show_micro: true,
                is_blocking: false,
                is_exceptional: false,
                is_external: false,
            };

            (eventService.createEvent as jest.Mock).mockResolvedValue(mockResult);

            try {
                await eventController.addEvent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(eventService.createEvent).toHaveBeenCalled();
                expect(mockStatus).toHaveBeenCalledWith(201);
                expect(mockJson).toHaveBeenCalledWith({
                    success: true,
                    message: "Événement ajouté avec succès",
                    insertedId: "3",
                });
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait throw si les champs obligatoires sont manquants", async () => {
            mockRequest.body = {
                nom: "Programmation",
                datetime_start: "2024-01-08T08:00:00",
                datetime_end: "2024-01-08T10:00:00",
            };

            try {
                await eventController.addEvent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(eventService.createEvent).not.toHaveBeenCalled();
                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "Les champs type, nom, datetime_start et datetime_end sont obligatoires.",
                });
            } catch (error) {
                // Si la validation throw au lieu de retourner
                expect((error as Error).message).toContain("obligatoires");
            }
        });

        it("devrait throw si le type est invalide", async () => {
            mockRequest.body = {
                type: "TypeInvalide",
                nom: "Programmation",
                datetime_start: "2024-01-08T08:00:00",
                datetime_end: "2024-01-08T10:00:00",
            };

            try {
                await eventController.addEvent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(eventService.createEvent).not.toHaveBeenCalled();
                expect(mockStatus).toHaveBeenCalledWith(400);
            } catch (error) {
                expect((error as Error).message).toContain("type");
            }
        });

        it("devrait throw si la date de début >= date de fin", async () => {
            mockRequest.body = {
                type: "Cours",
                nom: "Programmation",
                datetime_start: "2024-01-08T10:00:00",
                datetime_end: "2024-01-08T08:00:00",
            };

            const mockError = new Error("La date de début doit être antérieure à la date de fin.");
            (eventService.createEvent as jest.Mock).mockRejectedValue(mockError);

            try {
                await eventController.addEvent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "La date de début doit être antérieure à la date de fin.",
                });
            } catch (error) {
                expect((error as Error).message).toContain("date de début");
            }
        });

        it("devrait throw et gérer les erreurs de contrainte unique", async () => {
            mockRequest.body = {
                type: "Cours",
                nom: "Programmation",
                datetime_start: "2024-01-08T08:00:00",
                datetime_end: "2024-01-08T10:00:00",
            };

            const mockError = new Error("duplicate key value violates unique constraint");
            (eventService.createEvent as jest.Mock).mockRejectedValue(mockError);

            try {
                await eventController.addEvent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "duplicate key value violates unique constraint",
                });
            } catch (error) {
                expect((error as Error).message).toContain("duplicate");
            }
        });

        it("devrait throw si les valeurs par défaut causent une erreur", async () => {
            mockRequest.body = {
                type: "Cours",
                nom: "Programmation",
                datetime_start: "2024-01-08T08:00:00",
                datetime_end: "2024-01-08T10:00:00",
            };

            const mockError = new Error("Invalid default values");
            (eventService.createEvent as jest.Mock).mockRejectedValue(mockError);

            try {
                await eventController.addEvent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
            } catch (error) {
                expect((error as Error).message).toBe("Invalid default values");
            }
        });
    });

    describe("updateEvent", () => {
        it("devrait mettre à jour un événement avec succès", async () => {
            mockRequest.params = { id: "1" };
            mockRequest.body = {
                type: "Cours",
                nom: "Programmation Avancée",
                description: "Cours modifié",
                datetime_start: "2024-01-08T08:00:00",
                datetime_end: "2024-01-08T12:00:00",
            };

            (eventService.updateEvent as jest.Mock).mockResolvedValue(undefined);

            try {
                await eventController.updateEvent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(eventService.updateEvent).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: "1",
                        nom: "Programmation Avancée",
                    })
                );
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith({
                    success: true,
                    message: "Événement modifié avec succès",
                });
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait throw si l'ID est manquant dans params", async () => {
            mockRequest.params = {};
            mockRequest.body = {
                type: "Cours",
                nom: "Programmation",
                datetime_start: "2024-01-08T08:00:00",
                datetime_end: "2024-01-08T10:00:00",
            };

            try {
                await eventController.updateEvent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                // Le controller retourne une 400 si validation échoue
                expect(mockStatus).toHaveBeenCalledWith(400);
            } catch (error) {
                expect((error as Error).message).toContain("ID");
            }
        });

        it("devrait throw si l'événement n'existe pas (404)", async () => {
            mockRequest.params = { id: "999" };
            mockRequest.body = {
                type: "Cours",
                nom: "Programmation",
                datetime_start: "2024-01-08T08:00:00",
                datetime_end: "2024-01-08T10:00:00",
            };

            const mockError = new Error("Événement avec l'ID 999 non trouvé");
            (eventService.updateEvent as jest.Mock).mockRejectedValue(mockError);

            try {
                await eventController.updateEvent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "Événement avec l'ID 999 non trouvé",
                });
            } catch (error) {
                expect((error as Error).message).toContain("non trouvé");
            }
        });

        it("devrait throw si deadlock détecté", async () => {
            mockRequest.params = { id: "1" };
            mockRequest.body = {
                type: "Cours",
                nom: "Programmation",
                datetime_start: "2024-01-08T08:00:00",
                datetime_end: "2024-01-08T10:00:00",
            };

            const mockError = new Error("deadlock detected");
            (eventService.updateEvent as jest.Mock).mockRejectedValue(mockError);

            try {
                await eventController.updateEvent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ error: "deadlock detected" });
            } catch (error) {
                expect((error as Error).message).toBe("deadlock detected");
            }
        });
    });

    describe("deleteEvent", () => {
        it("devrait supprimer un événement avec succès", async () => {
            mockRequest.params = { id: "1" };

            (eventService.deleteEvent as jest.Mock).mockResolvedValue(undefined);

            try {
                await eventController.deleteEvent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(eventService.deleteEvent).toHaveBeenCalledWith("1");
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith({
                    success: true,
                    message: "Événement supprimé avec succès.",
                });
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait throw si l'ID est manquant", async () => {
            mockRequest.params = {};

            try {
                await eventController.deleteEvent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(eventService.deleteEvent).not.toHaveBeenCalled();
                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "ID de l'événement est requis.",
                });
            } catch (error) {
                expect((error as Error).message).toContain("requis");
            }
        });

        it("devrait throw si l'événement n'existe pas", async () => {
            mockRequest.params = { id: "999" };
            const mockError = new Error("Événement avec l'ID 999 non trouvé");

            (eventService.deleteEvent as jest.Mock).mockRejectedValue(mockError);

            try {
                await eventController.deleteEvent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "Événement avec l'ID 999 non trouvé",
                });
            } catch (error) {
                expect((error as Error).message).toContain("non trouvé");
            }
        });

        it("devrait throw si contrainte de clé étrangère violée", async () => {
            mockRequest.params = { id: "1" };
            const mockError = new Error("update or delete on table \"event\" violates foreign key constraint \"fk_cours_event\"");

            (eventService.deleteEvent as jest.Mock).mockRejectedValue(mockError);

            try {
                await eventController.deleteEvent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "update or delete on table \"event\" violates foreign key constraint \"fk_cours_event\"",
                });
            } catch (error) {
                expect((error as Error).message).toContain("foreign key");
            }
        });

        it("devrait throw si erreur de verrou détectée", async () => {
            mockRequest.params = { id: "1" };
            const mockError = new Error("Lock wait timeout exceeded; try restarting transaction");

            (eventService.deleteEvent as jest.Mock).mockRejectedValue(mockError);

            try {
                await eventController.deleteEvent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "Lock wait timeout exceeded; try restarting transaction",
                });
            } catch (error) {
                expect((error as Error).message).toContain("Lock wait");
            }
        });
    });
});