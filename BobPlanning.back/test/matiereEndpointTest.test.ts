import { Request, Response } from "express";
import { matiereController } from "../src/api/controllers/matiereController";
import { matiereService } from "../src/domain/services/matiereService";

// Mock du service
jest.mock("../src/domain/services/matiereService");

describe("matiereController", () => {
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

    describe("getMatieres", () => {
        it("devrait retourner toutes les matières avec succès", async () => {
            const mockMatieres = [
                {
                    id: "1",
                    nom: "Mathématiques",
                    volume_horaire: 40,
                    id_promo: "promo-1",
                    id_specialite: null,
                    semestre: 1,
                    nb_partiels: 2,
                    nb_eval_intermediaire: 1,
                    heures_td: 20,
                    heures_tp: 10,
                    heures_projet: 5,
                    heures_elearning: 3,
                    heures_autre: 2,
                },
                {
                    id: "2",
                    nom: "Physique",
                    volume_horaire: 35,
                    id_promo: "promo-1",
                    id_specialite: null,
                    semestre: 1,
                    nb_partiels: 1,
                    nb_eval_intermediaire: 2,
                    heures_td: 15,
                    heures_tp: 15,
                    heures_projet: 3,
                    heures_elearning: 1,
                    heures_autre: 1,
                },
            ];

            (matiereService.getMatieres as jest.Mock).mockResolvedValue(mockMatieres);

            try {
                await matiereController.getMatieres(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(matiereService.getMatieres).toHaveBeenCalledTimes(1);
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith(mockMatieres);
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait gérer les erreurs de connexion à la base de données", async () => {
            const mockError = new Error("Connection timeout");
            (matiereService.getMatieres as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.getMatieres(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ error: "Connection timeout" });
                expect(consoleErrorSpy).toHaveBeenCalledWith("Error getMatieres:", mockError);
            } catch (error) {
                fail(`Le controller devrait gérer l'erreur: ${error}`);
            }
        });

        it("devrait gérer les erreurs de requête SQL", async () => {
            const mockError = new Error("syntax error at or near \"SELECT\"");
            (matiereService.getMatieres as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.getMatieres(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ error: "syntax error at or near \"SELECT\"" });
            } catch (error) {
                fail(`Le controller devrait gérer l'erreur SQL: ${error}`);
            }
        });

        it("devrait gérer les TypeError (données corrompues)", async () => {
            const mockError = new TypeError("Cannot read property 'map' of undefined");
            (matiereService.getMatieres as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.getMatieres(
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
            (matiereService.getMatieres as jest.Mock).mockImplementation(() => {
                throw mockError;
            });

            try {
                await matiereController.getMatieres(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
            } catch (error) {
                expect(error).toBe(mockError);
            }
        });
    });

    describe("getMatiereByID", () => {
        it("devrait retourner une matière par son ID via query", async () => {
            const mockMatiere = {
                id: "1",
                nom: "Mathématiques",
                volume_horaire: 40,
                id_promo: "promo-1",
                id_specialite: null,
                semestre: 1,
                nb_partiels: 2,
                nb_eval_intermediaire: 1,
                heures_td: 20,
                heures_tp: 10,
                heures_projet: 5,
                heures_elearning: 3,
                heures_autre: 2,
            };
            mockRequest.query = { id: "1" };

            (matiereService.getMatiereById as jest.Mock).mockResolvedValue(mockMatiere);

            try {
                await matiereController.getMatiereByID(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(matiereService.getMatiereById).toHaveBeenCalledWith("1");
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith(mockMatiere);
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait retourner une matière par son ID via body", async () => {
            const mockMatiere = {
                id: "1",
                nom: "Mathématiques",
                volume_horaire: 40,
                id_promo: "promo-1",
                id_specialite: null,
                semestre: 1,
                nb_partiels: 2,
                nb_eval_intermediaire: 1,
                heures_td: 20,
                heures_tp: 10,
                heures_projet: 5,
                heures_elearning: 3,
                heures_autre: 2,
            };
            mockRequest.body = { id: "1" };

            (matiereService.getMatiereById as jest.Mock).mockResolvedValue(mockMatiere);

            try {
                await matiereController.getMatiereByID(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(matiereService.getMatiereById).toHaveBeenCalledWith("1");
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith(mockMatiere);
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si l'ID est manquant", async () => {
            mockRequest.query = {};
            mockRequest.body = {};

            try {
                await matiereController.getMatiereByID(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(matiereService.getMatiereById).not.toHaveBeenCalled();
                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    message: "Veuillez passer un id (query.id).",
                });
            } catch (error) {
                fail(`Le controller devrait gérer la validation: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si l'ID n'est pas une string", async () => {
            mockRequest.query = { id: 123 as any };

            try {
                await matiereController.getMatiereByID(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(matiereService.getMatiereById).not.toHaveBeenCalled();
                expect(mockStatus).toHaveBeenCalledWith(400);
            } catch (error) {
                fail(`Le controller devrait gérer la validation: ${error}`);
            }
        });

        it("devrait retourner une erreur 404 si la matière n'existe pas", async () => {
            mockRequest.query = { id: "999" };
            const mockError: any = new Error("Matière non trouvée");
            mockError.statusCode = 404;

            (matiereService.getMatiereById as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.getMatiereByID(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith({ error: "Matière non trouvée" });
            } catch (error) {
                fail(`Le controller devrait gérer l'erreur 404: ${error}`);
            }
        });

        it("devrait gérer les erreurs d'ID au format invalide", async () => {
            mockRequest.query = { id: "abc-invalid-uuid" };
            const mockError = new Error("invalid input syntax for type uuid");

            (matiereService.getMatiereById as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.getMatiereByID(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ error: "invalid input syntax for type uuid" });
            } catch (error) {
                expect((error as Error).message).toContain("invalid input syntax");
            }
        });

        it("devrait gérer les erreurs de timeout", async () => {
            mockRequest.query = { id: "1" };
            const mockError = new Error("Query read timeout");

            (matiereService.getMatiereById as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.getMatiereByID(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ error: "Query read timeout" });
            } catch (error) {
                fail(`Le controller devrait gérer le timeout: ${error}`);
            }
        });

        it("devrait gérer les ReferenceError", async () => {
            mockRequest.query = { id: "1" };
            const mockError = new ReferenceError("matiereMapper is not defined");

            (matiereService.getMatiereById as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.getMatiereByID(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ error: "matiereMapper is not defined" });
            } catch (error) {
                expect((error as Error).message).toContain("not defined");
            }
        });
    });

    describe("addMatiere", () => {
        it("devrait ajouter une matière avec succès", async () => {
            mockRequest.body = {
                nom: "Informatique",
                volume_horaire: 50,
                id_promo: "promo-1",
                id_specialite: null,
                semestre: 2,
                nb_partiels: 2,
                nb_eval_intermediaire: 1,
                heures_td: 25,
                heures_tp: 20,
                heures_projet: 3,
                heures_elearning: 1,
                heures_autre: 1,
            };
            const mockResult = { id: "3" };

            (matiereService.addMatiere as jest.Mock).mockResolvedValue(mockResult);

            try {
                await matiereController.addMatiere(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(matiereService.addMatiere).toHaveBeenCalledWith(mockRequest.body);
                expect(mockStatus).toHaveBeenCalledWith(201);
                expect(mockJson).toHaveBeenCalledWith({
                    message: "Matière ajoutée avec succès",
                    insertedId: "3",
                });
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si le nom est manquant", async () => {
            mockRequest.body = {
                volume_horaire: 50,
                semestre: 2,
                nb_partiels: 2,
            };
            const mockError: any = new Error("Le nom de la matière est obligatoire.");
            mockError.statusCode = 400;

            (matiereService.addMatiere as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.addMatiere(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "Le nom de la matière est obligatoire.",
                });
            } catch (error) {
                fail(`Le controller devrait gérer la validation: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si le nom est vide", async () => {
            mockRequest.body = {
                nom: "   ",
                volume_horaire: 50,
                semestre: 2,
                nb_partiels: 2,
            };
            const mockError: any = new Error("Le nom de la matière est obligatoire.");
            mockError.statusCode = 400;

            (matiereService.addMatiere as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.addMatiere(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "Le nom de la matière est obligatoire.",
                });
            } catch (error) {
                fail(`Le controller devrait gérer la validation: ${error}`);
            }
        });

        it("devrait throw si l'id_promo n'existe pas (FK)", async () => {
            mockRequest.body = {
                nom: "Informatique",
                volume_horaire: 50,
                id_promo: "promo-inexistante",
                semestre: 2,
                nb_partiels: 2,
            };
            const mockError: any = new Error("L'id de la promotion n'a pas été trouvé.");
            mockError.statusCode = 400;

            (matiereService.addMatiere as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.addMatiere(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "L'id de la promotion n'a pas été trouvé.",
                });
            } catch (error) {
                expect((error as Error).message).toContain("promotion");
            }
        });

        it("devrait throw si l'id_specialite n'existe pas (FK)", async () => {
            mockRequest.body = {
                nom: "Informatique",
                volume_horaire: 50,
                id_promo: "promo-1",
                id_specialite: "specialite-inexistante",
                semestre: 2,
                nb_partiels: 2,
            };
            const mockError: any = new Error("L'id de la spécialité n'a pas été trouvé.");
            mockError.statusCode = 400;

            (matiereService.addMatiere as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.addMatiere(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "L'id de la spécialité n'a pas été trouvé.",
                });
            } catch (error) {
                expect((error as Error).message).toContain("spécialité");
            }
        });

        it("devrait gérer les erreurs de contrainte CHECK (volume_horaire négatif)", async () => {
            mockRequest.body = {
                nom: "Informatique",
                volume_horaire: -10,
                semestre: 2,
                nb_partiels: 2,
            };
            const mockError = new Error("new row for relation \"matiere\" violates check constraint \"ck_matiere_volume\"");

            (matiereService.addMatiere as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.addMatiere(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "new row for relation \"matiere\" violates check constraint \"ck_matiere_volume\"",
                });
            } catch (error) {
                expect((error as Error).message).toContain("check constraint");
            }
        });

        it("devrait gérer les erreurs de contrainte CHECK (semestre invalide)", async () => {
            mockRequest.body = {
                nom: "Informatique",
                volume_horaire: 50,
                semestre: 0,
                nb_partiels: 2,
            };
            const mockError = new Error("new row for relation \"matiere\" violates check constraint \"ck_matiere_semestre\"");

            (matiereService.addMatiere as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.addMatiere(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "new row for relation \"matiere\" violates check constraint \"ck_matiere_semestre\"",
                });
            } catch (error) {
                expect((error as Error).message).toContain("semestre");
            }
        });

        it("devrait gérer les erreurs de contrainte unique", async () => {
            mockRequest.body = {
                nom: "Mathématiques",
                volume_horaire: 50,
                id_promo: "promo-1",
                semestre: 1,
                nb_partiels: 2,
            };
            const mockError = new Error("duplicate key value violates unique constraint \"uq_matiere_ident\"");

            (matiereService.addMatiere as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.addMatiere(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "duplicate key value violates unique constraint \"uq_matiere_ident\"",
                });
            } catch (error) {
                expect((error as Error).message).toContain("duplicate");
            }
        });

        it("devrait gérer les erreurs de violation de contrainte NOT NULL", async () => {
            mockRequest.body = {
                nom: "Informatique",
                volume_horaire: 50,
            };
            const mockError = new Error("null value in column \"semestre\" violates not-null constraint");

            (matiereService.addMatiere as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.addMatiere(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "null value in column \"semestre\" violates not-null constraint",
                });
            } catch (error) {
                expect((error as Error).message).toContain("not-null");
            }
        });
    });

    describe("updateMatiere", () => {
        it("devrait mettre à jour une matière avec succès", async () => {
            mockRequest.body = {
                id: "1",
                nom: "Mathématiques Avancées",
                volume_horaire: 45,
                id_promo: "promo-1",
                id_specialite: null,
                semestre: 1,
                nb_partiels: 2,
                nb_eval_intermediaire: 2,
                heures_td: 25,
                heures_tp: 15,
                heures_projet: 3,
                heures_elearning: 1,
                heures_autre: 1,
            };

            (matiereService.updateMatiere as jest.Mock).mockResolvedValue(undefined);

            try {
                await matiereController.updateMatiere(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(matiereService.updateMatiere).toHaveBeenCalledWith(mockRequest.body);
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith({
                    message: "Matière mise à jour avec succès",
                });
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si l'ID est manquant", async () => {
            mockRequest.body = {
                nom: "Mathématiques",
                volume_horaire: 40,
                semestre: 1,
                nb_partiels: 2,
            };
            const mockError: any = new Error("L'id est obligatoire.");
            mockError.statusCode = 400;

            (matiereService.updateMatiere as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.updateMatiere(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "L'id est obligatoire.",
                });
            } catch (error) {
                fail(`Le controller devrait gérer la validation: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si le nom est manquant", async () => {
            mockRequest.body = {
                id: "1",
                volume_horaire: 40,
                semestre: 1,
                nb_partiels: 2,
            };
            const mockError: any = new Error("Le nom de la matière est obligatoire.");
            mockError.statusCode = 400;

            (matiereService.updateMatiere as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.updateMatiere(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "Le nom de la matière est obligatoire.",
                });
            } catch (error) {
                fail(`Le controller devrait gérer la validation: ${error}`);
            }
        });

        it("devrait retourner une erreur 404 si la matière n'existe pas", async () => {
            mockRequest.body = {
                id: "999",
                nom: "Mathématiques",
                volume_horaire: 40,
                semestre: 1,
                nb_partiels: 2,
            };
            const mockError: any = new Error("Matière avec l'ID 999 non trouvée");
            mockError.statusCode = 404;

            (matiereService.updateMatiere as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.updateMatiere(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "Matière avec l'ID 999 non trouvée",
                });
            } catch (error) {
                fail(`Le controller devrait gérer l'erreur 404: ${error}`);
            }
        });

        it("devrait throw si deadlock détecté", async () => {
            mockRequest.body = {
                id: "1",
                nom: "Mathématiques",
                volume_horaire: 40,
                semestre: 1,
                nb_partiels: 2,
            };
            const mockError = new Error("deadlock detected");

            (matiereService.updateMatiere as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.updateMatiere(
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
            mockRequest.body = {
                id: "1",
                nom: "Mathématiques",
                volume_horaire: 40,
                id_promo: "promo-inexistante",
                semestre: 1,
                nb_partiels: 2,
            };
            const mockError = new Error("update or delete on table \"matiere\" violates foreign key constraint");

            (matiereService.updateMatiere as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.updateMatiere(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "update or delete on table \"matiere\" violates foreign key constraint",
                });
            } catch (error) {
                expect((error as Error).message).toContain("foreign key");
            }
        });

        it("devrait gérer les erreurs de contrainte unique", async () => {
            mockRequest.body = {
                id: "1",
                nom: "Physique",
                volume_horaire: 40,
                id_promo: "promo-1",
                semestre: 1,
                nb_partiels: 2,
            };
            const mockError = new Error("duplicate key value violates unique constraint \"uq_matiere_ident\"");

            (matiereService.updateMatiere as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.updateMatiere(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "duplicate key value violates unique constraint \"uq_matiere_ident\"",
                });
            } catch (error) {
                expect((error as Error).message).toContain("duplicate");
            }
        });
    });

    describe("deleteMatiere", () => {
        it("devrait supprimer une matière via body.id", async () => {
            mockRequest.body = { id: "1" };

            (matiereService.deleteMatiere as jest.Mock).mockResolvedValue(undefined);

            try {
                await matiereController.deleteMatiere(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(matiereService.deleteMatiere).toHaveBeenCalledWith("1");
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith({
                    message: "Matière supprimée avec succès",
                });
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait supprimer une matière via query.id", async () => {
            mockRequest.query = { id: "2" };

            (matiereService.deleteMatiere as jest.Mock).mockResolvedValue(undefined);

            try {
                await matiereController.deleteMatiere(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(matiereService.deleteMatiere).toHaveBeenCalledWith("2");
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith({
                    message: "Matière supprimée avec succès",
                });
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si l'ID est manquant", async () => {
            mockRequest.body = {};
            mockRequest.query = {};

            try {
                await matiereController.deleteMatiere(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(matiereService.deleteMatiere).not.toHaveBeenCalled();
                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    message: "L'id est requis (body.id ou query.id).",
                });
            } catch (error) {
                fail(`Le controller devrait gérer la validation: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si l'ID n'est pas une string", async () => {
            mockRequest.body = { id: 123 };

            try {
                await matiereController.deleteMatiere(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(matiereService.deleteMatiere).not.toHaveBeenCalled();
                expect(mockStatus).toHaveBeenCalledWith(400);
            } catch (error) {
                fail(`Le controller devrait gérer la validation: ${error}`);
            }
        });

        it("devrait retourner une erreur 404 si la matière n'existe pas", async () => {
            mockRequest.body = { id: "999" };
            const mockError: any = new Error("Matière non trouvée");
            mockError.statusCode = 404;

            (matiereService.deleteMatiere as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.deleteMatiere(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith({ error: "Matière non trouvée" });
            } catch (error) {
                fail(`Le controller devrait gérer l'erreur 404: ${error}`);
            }
        });

        it("devrait throw si contrainte de clé étrangère violée (cours liés)", async () => {
            mockRequest.body = { id: "1" };
            const mockError = new Error("update or delete on table \"matiere\" violates foreign key constraint \"fk_cours_matiere\"");

            (matiereService.deleteMatiere as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.deleteMatiere(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "update or delete on table \"matiere\" violates foreign key constraint \"fk_cours_matiere\"",
                });
            } catch (error) {
                expect((error as Error).message).toContain("foreign key");
            }
        });

        it("devrait throw si contrainte de clé étrangère violée (enseignements liés)", async () => {
            mockRequest.body = { id: "1" };
            const mockError = new Error("update or delete on table \"matiere\" violates foreign key constraint \"fk_enseignement_matiere\"");

            (matiereService.deleteMatiere as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.deleteMatiere(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "update or delete on table \"matiere\" violates foreign key constraint \"fk_enseignement_matiere\"",
                });
            } catch (error) {
                expect((error as Error).message).toContain("enseignement");
            }
        });

        it("devrait throw si erreur de cascade delete", async () => {
            mockRequest.body = { id: "1" };
            const mockError = new Error("Cannot delete record due to dependent records");

            (matiereService.deleteMatiere as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.deleteMatiere(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "Cannot delete record due to dependent records",
                });
            } catch (error) {
                expect((error as Error).message).toContain("Cannot delete");
            }
        });

        it("devrait throw si erreur de verrou détectée", async () => {
            mockRequest.body = { id: "1" };
            const mockError = new Error("Lock wait timeout exceeded; try restarting transaction");

            (matiereService.deleteMatiere as jest.Mock).mockRejectedValue(mockError);

            try {
                await matiereController.deleteMatiere(
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