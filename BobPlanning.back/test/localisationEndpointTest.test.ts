import { Request, Response } from "express";
import { localisationController } from "../src/api/controllers/localisationController";
import { localisationService } from "../src/domain/services/localisationService";

// Mock du service
jest.mock("../src/domain/services/localisationService");

describe("localisationController", () => {
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

        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        jest.clearAllMocks();
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    describe("getAllLocalisations", () => {
        it("devrait retourner toutes les localisations avec succès", async () => {
            const mockLocalisations = [
                {
                    id: "1",
                    id_salle: "salle-1",
                    id_event: "event-1",
                },
                {
                    id: "2",
                    id_salle: "salle-2",
                    id_event: "event-1",
                },
            ];

            (localisationService.getAllLocalisations as jest.Mock).mockResolvedValue(mockLocalisations);

            try {
                await localisationController.getAllLocalisations(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(localisationService.getAllLocalisations).toHaveBeenCalledTimes(1);
                expect(mockJson).toHaveBeenCalledWith(mockLocalisations);
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait gérer les erreurs de connexion à la base de données", async () => {
            const mockError = new Error("Connection timeout");
            (localisationService.getAllLocalisations as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.getAllLocalisations(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ error: "Connection timeout" });
                expect(consoleErrorSpy).toHaveBeenCalledWith("Error in getAllLocalisations:", mockError);
            } catch (error) {
                fail(`Le controller devrait gérer l'erreur: ${error}`);
            }
        });

        it("devrait gérer les erreurs de requête SQL", async () => {
            const mockError = new Error("syntax error at or near \"SELCT\"");
            (localisationService.getAllLocalisations as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.getAllLocalisations(
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
            (localisationService.getAllLocalisations as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.getAllLocalisations(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ error: "Cannot read property 'map' of undefined" });
            } catch (error) {
                fail(`Le controller devrait gérer le TypeError: ${error}`);
            }
        });

        it("devrait throw une erreur critique non gérée", async () => {
            const mockError = new Error("Erreur critique");
            (localisationService.getAllLocalisations as jest.Mock).mockImplementation(() => {
                throw mockError;
            });

            try {
                await localisationController.getAllLocalisations(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
            } catch (error) {
                expect(error).toBe(mockError);
            }
        });
    });

    describe("getLocalisationsByEvent", () => {
        it("devrait retourner les localisations d'un événement", async () => {
            const mockLocalisations = [
                {
                    id: "1",
                    id_salle: "salle-1",
                    id_event: "event-1",
                },
                {
                    id: "2",
                    id_salle: "salle-2",
                    id_event: "event-1",
                },
            ];
            mockRequest.params = { id_event: "event-1" };

            (localisationService.getLocalisationsByEvent as jest.Mock).mockResolvedValue(mockLocalisations);

            try {
                await localisationController.getLocalisationsByEvent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(localisationService.getLocalisationsByEvent).toHaveBeenCalledWith("event-1");
                expect(mockJson).toHaveBeenCalledWith(mockLocalisations);
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait retourner un tableau vide si aucune localisation trouvée", async () => {
            mockRequest.params = { id_event: "event-999" };

            (localisationService.getLocalisationsByEvent as jest.Mock).mockResolvedValue([]);

            try {
                await localisationController.getLocalisationsByEvent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(localisationService.getLocalisationsByEvent).toHaveBeenCalledWith("event-999");
                expect(mockJson).toHaveBeenCalledWith([]);
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait gérer les erreurs d'ID au format invalide", async () => {
            mockRequest.params = { id_event: "abc-invalid-uuid" };
            const mockError = new Error("invalid input syntax for type uuid");

            (localisationService.getLocalisationsByEvent as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.getLocalisationsByEvent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ error: "invalid input syntax for type uuid" });
            } catch (error) {
                expect((error as Error).message).toContain("invalid input syntax");
            }
        });

        it("devrait throw si erreur de timeout", async () => {
            mockRequest.params = { id_event: "event-1" };
            const mockError = new Error("Query read timeout");

            (localisationService.getLocalisationsByEvent as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.getLocalisationsByEvent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
            } catch (error) {
                expect((error as Error).message).toContain("timeout");
            }
        });
    });

    describe("getLocalisationsBySalle", () => {
        it("devrait retourner les localisations d'une salle", async () => {
            const mockLocalisations = [
                {
                    id: "1",
                    id_salle: "salle-1",
                    id_event: "event-1",
                },
                {
                    id: "3",
                    id_salle: "salle-1",
                    id_event: "event-2",
                },
            ];
            mockRequest.params = { id_salle: "salle-1" };

            (localisationService.getLocalisationsBySalle as jest.Mock).mockResolvedValue(mockLocalisations);

            try {
                await localisationController.getLocalisationsBySalle(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(localisationService.getLocalisationsBySalle).toHaveBeenCalledWith("salle-1");
                expect(mockJson).toHaveBeenCalledWith(mockLocalisations);
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait retourner un tableau vide si aucune localisation trouvée", async () => {
            mockRequest.params = { id_salle: "salle-999" };

            (localisationService.getLocalisationsBySalle as jest.Mock).mockResolvedValue([]);

            try {
                await localisationController.getLocalisationsBySalle(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(localisationService.getLocalisationsBySalle).toHaveBeenCalledWith("salle-999");
                expect(mockJson).toHaveBeenCalledWith([]);
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait gérer les erreurs d'ID au format invalide", async () => {
            mockRequest.params = { id_salle: "abc-invalid-uuid" };
            const mockError = new Error("invalid input syntax for type uuid");

            (localisationService.getLocalisationsBySalle as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.getLocalisationsBySalle(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ error: "invalid input syntax for type uuid" });
            } catch (error) {
                expect((error as Error).message).toContain("invalid input syntax");
            }
        });

        it("devrait throw si erreur de base de données", async () => {
            mockRequest.params = { id_salle: "salle-1" };
            const mockError = new Error("Database connection lost");

            (localisationService.getLocalisationsBySalle as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.getLocalisationsBySalle(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
            } catch (error) {
                expect((error as Error).message).toContain("Database");
            }
        });
    });

    describe("getLocalisationById", () => {
        it("devrait retourner une localisation par son ID", async () => {
            const mockLocalisation = {
                id: "1",
                id_salle: "salle-1",
                id_event: "event-1",
            };
            mockRequest.params = { id: "1" };

            (localisationService.getLocalisationById as jest.Mock).mockResolvedValue(mockLocalisation);

            try {
                await localisationController.getLocalisationById(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(localisationService.getLocalisationById).toHaveBeenCalledWith("1");
                expect(mockJson).toHaveBeenCalledWith(mockLocalisation);
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait retourner une erreur 404 si la localisation n'existe pas", async () => {
            mockRequest.params = { id: "999" };
            const mockError = new Error("Localisation avec l'ID 999 non trouvée");

            (localisationService.getLocalisationById as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.getLocalisationById(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith({ error: "Localisation avec l'ID 999 non trouvée" });
            } catch (error) {
                fail(`Le controller devrait gérer l'erreur 404: ${error}`);
            }
        });

        it("devrait gérer les erreurs d'ID au format invalide", async () => {
            mockRequest.params = { id: "abc-invalid-uuid" };
            const mockError = new Error("invalid input syntax for type uuid");

            (localisationService.getLocalisationById as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.getLocalisationById(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ error: "invalid input syntax for type uuid" });
            } catch (error) {
                expect((error as Error).message).toContain("invalid input syntax");
            }
        });

        it("devrait throw si erreur de timeout", async () => {
            mockRequest.params = { id: "1" };
            const mockError = new Error("Query read timeout");

            (localisationService.getLocalisationById as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.getLocalisationById(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
            } catch (error) {
                expect((error as Error).message).toContain("timeout");
            }
        });

        it("devrait gérer les ReferenceError", async () => {
            mockRequest.params = { id: "1" };
            const mockError = new ReferenceError("localisationMapper is not defined");

            (localisationService.getLocalisationById as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.getLocalisationById(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ error: "localisationMapper is not defined" });
            } catch (error) {
                expect((error as Error).message).toContain("not defined");
            }
        });
    });

    describe("addLocalisation", () => {
        it("devrait ajouter une localisation avec succès", async () => {
            mockRequest.body = {
                id_salle: "salle-1",
                id_event: "event-1",
            };
            const mockResult = {
                id: "3",
                id_salle: "salle-1",
                id_event: "event-1",
            };

            (localisationService.addLocalisation as jest.Mock).mockResolvedValue(mockResult);

            try {
                await localisationController.addLocalisation(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(localisationService.addLocalisation).toHaveBeenCalledWith({
                    id_salle: "salle-1",
                    id_event: "event-1",
                });
                expect(mockStatus).toHaveBeenCalledWith(201);
                expect(mockJson).toHaveBeenCalledWith({
                    message: "Localisation créée avec succès",
                    data: mockResult,
                });
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si id_salle est manquant", async () => {
            mockRequest.body = { id_event: "event-1" };

            try {
                await localisationController.addLocalisation(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(localisationService.addLocalisation).not.toHaveBeenCalled();
                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "Les champs id_salle et id_event sont obligatoires",
                });
            } catch (error) {
                fail(`Le controller devrait gérer la validation: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si id_event est manquant", async () => {
            mockRequest.body = { id_salle: "salle-1" };

            try {
                await localisationController.addLocalisation(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(localisationService.addLocalisation).not.toHaveBeenCalled();
                expect(mockStatus).toHaveBeenCalledWith(400);
            } catch (error) {
                fail(`Le controller devrait gérer la validation: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si tous les champs sont manquants", async () => {
            mockRequest.body = {};

            try {
                await localisationController.addLocalisation(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(localisationService.addLocalisation).not.toHaveBeenCalled();
                expect(mockStatus).toHaveBeenCalledWith(400);
            } catch (error) {
                fail(`Le controller devrait gérer la validation: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si la localisation existe déjà", async () => {
            mockRequest.body = {
                id_salle: "salle-1",
                id_event: "event-1",
            };
            const mockError = new Error("Cette salle est déjà associée à cet événement");

            (localisationService.addLocalisation as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.addLocalisation(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "Cette salle est déjà associée à cet événement",
                });
            } catch (error) {
                fail(`Le controller devrait gérer l'erreur de duplication: ${error}`);
            }
        });

        it("devrait throw si contrainte de clé étrangère violée (salle inexistante)", async () => {
            mockRequest.body = {
                id_salle: "salle-inexistante",
                id_event: "event-1",
            };
            const mockError = new Error("insert or update on table \"localisation\" violates foreign key constraint \"fk_localisation_salle\"");

            (localisationService.addLocalisation as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.addLocalisation(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "insert or update on table \"localisation\" violates foreign key constraint \"fk_localisation_salle\"",
                });
            } catch (error) {
                expect((error as Error).message).toContain("foreign key");
            }
        });

        it("devrait throw si contrainte de clé étrangère violée (event inexistant)", async () => {
            mockRequest.body = {
                id_salle: "salle-1",
                id_event: "event-inexistant",
            };
            const mockError = new Error("insert or update on table \"localisation\" violates foreign key constraint \"fk_localisation_event\"");

            (localisationService.addLocalisation as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.addLocalisation(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "insert or update on table \"localisation\" violates foreign key constraint \"fk_localisation_event\"",
                });
            } catch (error) {
                expect((error as Error).message).toContain("foreign key");
            }
        });

        it("devrait gérer les erreurs de contrainte unique", async () => {
            mockRequest.body = {
                id_salle: "salle-1",
                id_event: "event-1",
            };
            const mockError = new Error("duplicate key value violates unique constraint \"uq_localisation_salle_event\"");

            (localisationService.addLocalisation as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.addLocalisation(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "duplicate key value violates unique constraint \"uq_localisation_salle_event\"",
                });
            } catch (error) {
                expect((error as Error).message).toContain("duplicate");
            }
        });
    });

    describe("updateLocalisation", () => {
        it("devrait mettre à jour une localisation avec succès", async () => {
            mockRequest.params = { id: "1" };
            mockRequest.body = {
                id_salle: "salle-2",
                id_event: "event-1",
            };

            (localisationService.updateLocalisation as jest.Mock).mockResolvedValue(undefined);

            try {
                await localisationController.updateLocalisation(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(localisationService.updateLocalisation).toHaveBeenCalledWith({
                    id: "1",
                    id_salle: "salle-2",
                    id_event: "event-1",
                });
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith({
                    message: "Localisation mise à jour avec succès",
                });
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si id_salle est manquant", async () => {
            mockRequest.params = { id: "1" };
            mockRequest.body = { id_event: "event-1" };

            try {
                await localisationController.updateLocalisation(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(localisationService.updateLocalisation).not.toHaveBeenCalled();
                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "Les champs id_salle et id_event sont obligatoires",
                });
            } catch (error) {
                fail(`Le controller devrait gérer la validation: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si id_event est manquant", async () => {
            mockRequest.params = { id: "1" };
            mockRequest.body = { id_salle: "salle-1" };

            try {
                await localisationController.updateLocalisation(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(localisationService.updateLocalisation).not.toHaveBeenCalled();
                expect(mockStatus).toHaveBeenCalledWith(400);
            } catch (error) {
                fail(`Le controller devrait gérer la validation: ${error}`);
            }
        });

        it("devrait retourner une erreur 404 si la localisation n'existe pas", async () => {
            mockRequest.params = { id: "999" };
            mockRequest.body = {
                id_salle: "salle-1",
                id_event: "event-1",
            };
            const mockError: any = new Error("Localisation avec l'ID 999 non trouvée");
            mockError.statusCode = 404;

            (localisationService.updateLocalisation as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.updateLocalisation(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "Localisation avec l'ID 999 non trouvée",
                });
            } catch (error) {
                fail(`Le controller devrait gérer l'erreur 404: ${error}`);
            }
        });

        it("devrait throw si la nouvelle combinaison existe déjà", async () => {
            mockRequest.params = { id: "1" };
            mockRequest.body = {
                id_salle: "salle-2",
                id_event: "event-1",
            };
            const mockError = new Error("Cette salle est déjà associée à cet événement");

            (localisationService.updateLocalisation as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.updateLocalisation(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "Cette salle est déjà associée à cet événement",
                });
            } catch (error) {
                expect((error as Error).message).toContain("déjà associée");
            }
        });

        it("devrait throw si deadlock détecté", async () => {
            mockRequest.params = { id: "1" };
            mockRequest.body = {
                id_salle: "salle-1",
                id_event: "event-1",
            };
            const mockError = new Error("deadlock detected");

            (localisationService.updateLocalisation as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.updateLocalisation(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ error: "deadlock detected" });
            } catch (error) {
                expect((error as Error).message).toBe("deadlock detected");
            }
        });

        it("devrait throw si contrainte de clé étrangère violée", async () => {
            mockRequest.params = { id: "1" };
            mockRequest.body = {
                id_salle: "salle-inexistante",
                id_event: "event-1",
            };
            const mockError = new Error("update or delete on table \"localisation\" violates foreign key constraint");

            (localisationService.updateLocalisation as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.updateLocalisation(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "update or delete on table \"localisation\" violates foreign key constraint",
                });
            } catch (error) {
                expect((error as Error).message).toContain("foreign key");
            }
        });
    });

    describe("deleteLocalisation", () => {
        it("devrait supprimer une localisation avec succès", async () => {
            mockRequest.params = { id: "1" };

            (localisationService.deleteLocalisation as jest.Mock).mockResolvedValue(undefined);

            try {
                await localisationController.deleteLocalisation(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(localisationService.deleteLocalisation).toHaveBeenCalledWith("1");
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith({
                    message: "Localisation supprimée avec succès",
                });
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si l'ID est manquant", async () => {
            mockRequest.params = {};

            try {
                await localisationController.deleteLocalisation(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(localisationService.deleteLocalisation).not.toHaveBeenCalled();
                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "L'ID de la localisation est requis",
                });
            } catch (error) {
                fail(`Le controller devrait gérer la validation: ${error}`);
            }
        });

        it("devrait retourner une erreur 404 si la localisation n'existe pas", async () => {
            mockRequest.params = { id: "999" };
            const mockError: any = new Error("Localisation avec l'ID 999 non trouvée");
            mockError.statusCode = 404;

            (localisationService.deleteLocalisation as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.deleteLocalisation(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "Localisation avec l'ID 999 non trouvée",
                });
            } catch (error) {
                fail(`Le controller devrait gérer l'erreur 404: ${error}`);
            }
        });

        it("devrait throw si erreur de base de données", async () => {
            mockRequest.params = { id: "1" };
            const mockError = new Error("Database connection lost");

            (localisationService.deleteLocalisation as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.deleteLocalisation(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "Database connection lost",
                });
            } catch (error) {
                expect((error as Error).message).toContain("Database");
            }
        });

        it("devrait throw si erreur de verrou détectée", async () => {
            mockRequest.params = { id: "1" };
            const mockError = new Error("Lock wait timeout exceeded; try restarting transaction");

            (localisationService.deleteLocalisation as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.deleteLocalisation(
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

    describe("deleteLocalisationsByEvent", () => {
        it("devrait supprimer toutes les localisations d'un événement", async () => {
            mockRequest.params = { id_event: "event-1" };

            (localisationService.deleteLocalisationsByEvent as jest.Mock).mockResolvedValue(3);

            try {
                await localisationController.deleteLocalisationsByEvent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(localisationService.deleteLocalisationsByEvent).toHaveBeenCalledWith("event-1");
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith({
                    message: "3 localisation(s) supprimée(s) avec succès",
                });
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait retourner 0 si aucune localisation à supprimer", async () => {
            mockRequest.params = { id_event: "event-999" };

            (localisationService.deleteLocalisationsByEvent as jest.Mock).mockResolvedValue(0);

            try {
                await localisationController.deleteLocalisationsByEvent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(localisationService.deleteLocalisationsByEvent).toHaveBeenCalledWith("event-999");
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith({
                    message: "0 localisation(s) supprimée(s) avec succès",
                });
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait throw si erreur d'ID au format invalide", async () => {
            mockRequest.params = { id_event: "abc-invalid-uuid" };
            const mockError = new Error("invalid input syntax for type uuid");

            (localisationService.deleteLocalisationsByEvent as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.deleteLocalisationsByEvent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "invalid input syntax for type uuid",
                });
            } catch (error) {
                expect((error as Error).message).toContain("invalid input syntax");
            }
        });

        it("devrait throw si erreur de base de données", async () => {
            mockRequest.params = { id_event: "event-1" };
            const mockError = new Error("Database error during bulk delete");

            (localisationService.deleteLocalisationsByEvent as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.deleteLocalisationsByEvent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
            } catch (error) {
                expect((error as Error).message).toContain("Database");
            }
        });
    });

    describe("deleteLocalisationsBySalle", () => {
        it("devrait supprimer toutes les localisations d'une salle", async () => {
            mockRequest.params = { id_salle: "salle-1" };

            (localisationService.deleteLocalisationsBySalle as jest.Mock).mockResolvedValue(5);

            try {
                await localisationController.deleteLocalisationsBySalle(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(localisationService.deleteLocalisationsBySalle).toHaveBeenCalledWith("salle-1");
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith({
                    message: "5 localisation(s) supprimée(s) avec succès",
                });
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait retourner 0 si aucune localisation à supprimer", async () => {
            mockRequest.params = { id_salle: "salle-999" };

            (localisationService.deleteLocalisationsBySalle as jest.Mock).mockResolvedValue(0);

            try {
                await localisationController.deleteLocalisationsBySalle(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(localisationService.deleteLocalisationsBySalle).toHaveBeenCalledWith("salle-999");
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith({
                    message: "0 localisation(s) supprimée(s) avec succès",
                });
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait throw si erreur d'ID au format invalide", async () => {
            mockRequest.params = { id_salle: "abc-invalid-uuid" };
            const mockError = new Error("invalid input syntax for type uuid");

            (localisationService.deleteLocalisationsBySalle as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.deleteLocalisationsBySalle(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "invalid input syntax for type uuid",
                });
            } catch (error) {
                expect((error as Error).message).toContain("invalid input syntax");
            }
        });

        it("devrait throw si erreur de base de données", async () => {
            mockRequest.params = { id_salle: "salle-1" };
            const mockError = new Error("Database error during bulk delete");

            (localisationService.deleteLocalisationsBySalle as jest.Mock).mockRejectedValue(mockError);

            try {
                await localisationController.deleteLocalisationsBySalle(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
            } catch (error) {
                expect((error as Error).message).toContain("Database");
            }
        });
    });
});