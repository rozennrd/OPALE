import { Request, Response } from "express";
import { groupeController } from "../src/api/controllers/groupeController";
import { groupeService } from "../src/domain/services/groupeService";

// Mock du service
jest.mock("../src/domain/services/groupeService");

describe("groupeController", () => {
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

    describe("getGroups", () => {
        it("devrait retourner tous les groupes avec succès", async () => {
            const mockGroups = [
                {
                    id: "1",
                    id_promo: "promo-1",
                    nom: "Groupe A",
                    effectifs: 25,
                },
                {
                    id: "2",
                    id_promo: "promo-1",
                    nom: "Groupe B",
                    effectifs: 30,
                },
            ];

            (groupeService.getGroups as jest.Mock).mockResolvedValue(mockGroups);

            try {
                await groupeController.getGroups(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(groupeService.getGroups).toHaveBeenCalledTimes(1);
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith(mockGroups);
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait gérer les erreurs de connexion à la base de données", async () => {
            const mockError = new Error("Connection timeout");
            (groupeService.getGroups as jest.Mock).mockRejectedValue(mockError);

            try {
                await groupeController.getGroups(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ error: "Connection timeout" });
                expect(consoleErrorSpy).toHaveBeenCalledWith("Error getGroups:", mockError);
            } catch (error) {
                fail(`Le controller devrait gérer l'erreur: ${error}`);
            }
        });

        it("devrait gérer les erreurs de requête SQL", async () => {
            const mockError = new Error("syntax error at or near \"SELCT\"");
            (groupeService.getGroups as jest.Mock).mockRejectedValue(mockError);

            try {
                await groupeController.getGroups(
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
            (groupeService.getGroups as jest.Mock).mockRejectedValue(mockError);

            try {
                await groupeController.getGroups(
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
            (groupeService.getGroups as jest.Mock).mockImplementation(() => {
                throw mockError;
            });

            try {
                await groupeController.getGroups(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
            } catch (error) {
                expect(error).toBe(mockError);
            }
        });
    });

    describe("getGroupById", () => {
        it("devrait retourner un groupe par son ID", async () => {
            const mockGroup = {
                id: "1",
                id_promo: "promo-1",
                nom: "Groupe A",
                effectifs: 25,
            };
            mockRequest.query = { id: "1" };

            (groupeService.getGroupById as jest.Mock).mockResolvedValue(mockGroup);

            try {
                await groupeController.getGroupById(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(groupeService.getGroupById).toHaveBeenCalledWith("1");
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith(mockGroup);
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait gérer le cas où l'ID est undefined", async () => {
            mockRequest.query = {};

            const mockError: any = new Error("Groupe non trouvé.");
            mockError.statusCode = 400;
            (groupeService.getGroupById as jest.Mock).mockRejectedValue(mockError);

            try {
                await groupeController.getGroupById(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(groupeService.getGroupById).toHaveBeenCalledWith("undefined");
                expect(mockStatus).toHaveBeenCalledWith(500);
            } catch (error) {
                fail(`Le controller devrait gérer l'ID undefined: ${error}`);
            }
        });

        it("devrait retourner une erreur 404 si le groupe n'existe pas", async () => {
            mockRequest.query = { id: "999" };
            const mockError: any = new Error("Groupe non trouvé.");
            mockError.statusCode = 404;

            (groupeService.getGroupById as jest.Mock).mockRejectedValue(mockError);

            try {
                await groupeController.getGroupById(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith({ error: "Groupe non trouvé." });
            } catch (error) {
                fail(`Le controller devrait gérer l'erreur 404: ${error}`);
            }
        });

        it("devrait gérer les erreurs d'ID au format invalide", async () => {
            mockRequest.query = { id: "abc-invalid-uuid" };
            const mockError = new Error("invalid input syntax for type uuid");

            (groupeService.getGroupById as jest.Mock).mockRejectedValue(mockError);

            try {
                await groupeController.getGroupById(
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

            (groupeService.getGroupById as jest.Mock).mockRejectedValue(mockError);

            try {
                await groupeController.getGroupById(
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
            const mockError = new ReferenceError("groupeMapper is not defined");

            (groupeService.getGroupById as jest.Mock).mockRejectedValue(mockError);

            try {
                await groupeController.getGroupById(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ error: "groupeMapper is not defined" });
            } catch (error) {
                expect((error as Error).message).toContain("not defined");
            }
        });
    });

    describe("addGroup", () => {
        it("devrait ajouter un groupe avec succès", async () => {
            mockRequest.body = {
                id_promo: "promo-1",
                nom: "Groupe C",
                effectifs: 28,
            };
            const mockResult = { id: "3" };

            (groupeService.addGroup as jest.Mock).mockResolvedValue(mockResult);

            try {
                await groupeController.addGroup(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(groupeService.addGroup).toHaveBeenCalledWith({
                    id_promo: "promo-1",
                    nom: "Groupe C",
                    effectifs: 28,
                });
                expect(mockStatus).toHaveBeenCalledWith(201);
                expect(mockJson).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: "Groupe ajouté avec succès !",
                    })
                );
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si id_promo est manquant", async () => {
            mockRequest.body = { nom: "Groupe C", effectifs: 28 };

            try {
                await groupeController.addGroup(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(groupeService.addGroup).not.toHaveBeenCalled();
                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    message: "Tous les champs sont requis.",
                });
            } catch (error) {
                fail(`Le controller devrait gérer la validation: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si nom est manquant", async () => {
            mockRequest.body = { id_promo: "promo-1", effectifs: 28 };

            try {
                await groupeController.addGroup(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(groupeService.addGroup).not.toHaveBeenCalled();
                expect(mockStatus).toHaveBeenCalledWith(400);
            } catch (error) {
                fail(`Le controller devrait gérer la validation: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si effectifs est manquant", async () => {
            mockRequest.body = { id_promo: "promo-1", nom: "Groupe C" };

            try {
                await groupeController.addGroup(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(groupeService.addGroup).not.toHaveBeenCalled();
                expect(mockStatus).toHaveBeenCalledWith(400);
            } catch (error) {
                fail(`Le controller devrait gérer la validation: ${error}`);
            }
        });

        it("devrait retourner une erreur 409 si le groupe existe déjà (contrainte unique)", async () => {
            mockRequest.body = {
                id_promo: "promo-1",
                nom: "Groupe A",
                effectifs: 25,
            };
            const mockError: any = new Error("Un groupe portant ce nom existe déjà pour cette promotion.");
            mockError.statusCode = 409;

            (groupeService.addGroup as jest.Mock).mockRejectedValue(mockError);

            try {
                await groupeController.addGroup(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(409);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "Un groupe portant ce nom existe déjà pour cette promotion.",
                });
            } catch (error) {
                fail(`Le controller devrait gérer l'erreur 409: ${error}`);
            }
        });

        it("devrait throw si contrainte de clé étrangère invalide", async () => {
            mockRequest.body = {
                id_promo: "promo-inexistante",
                nom: "Groupe C",
                effectifs: 28,
            };
            const mockError = new Error("insert or update on table \"groupe\" violates foreign key constraint \"fk_groupe_promotion\"");

            (groupeService.addGroup as jest.Mock).mockRejectedValue(mockError);

            try {
                await groupeController.addGroup(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "insert or update on table \"groupe\" violates foreign key constraint \"fk_groupe_promotion\"",
                });
            } catch (error) {
                expect((error as Error).message).toContain("foreign key");
            }
        });

        it("devrait gérer les erreurs de violation de contrainte NOT NULL", async () => {
            mockRequest.body = {
                id_promo: "promo-1",
                nom: "Groupe C",
                effectifs: 28,
            };
            const mockError = new Error("null value in column \"nom\" violates not-null constraint");

            (groupeService.addGroup as jest.Mock).mockRejectedValue(mockError);

            try {
                await groupeController.addGroup(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "null value in column \"nom\" violates not-null constraint",
                });
            } catch (error) {
                expect((error as Error).message).toContain("not-null");
            }
        });

        it("devrait gérer les erreurs de dépassement de longueur", async () => {
            mockRequest.body = {
                id_promo: "promo-1",
                nom: "A".repeat(300),
                effectifs: 28,
            };
            const mockError = new Error("value too long for type character varying(100)");

            (groupeService.addGroup as jest.Mock).mockRejectedValue(mockError);

            try {
                await groupeController.addGroup(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "value too long for type character varying(100)",
                });
            } catch (error) {
                expect((error as Error).message).toContain("too long");
            }
        });

        it("devrait throw si effectifs est négatif", async () => {
            mockRequest.body = {
                id_promo: "promo-1",
                nom: "Groupe C",
                effectifs: -5,
            };
            const mockError = new Error("new row for relation \"groupe\" violates check constraint");

            (groupeService.addGroup as jest.Mock).mockRejectedValue(mockError);

            try {
                await groupeController.addGroup(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
            } catch (error) {
                expect((error as Error).message).toContain("check constraint");
            }
        });
    });

    describe("updateGroup", () => {
        it("devrait mettre à jour un groupe avec succès", async () => {
            mockRequest.body = {
                id: "1",
                id_promo: "promo-2",
                nom: "Groupe A Modifié",
                effectifs: 30,
            };

            (groupeService.updateGroup as jest.Mock).mockResolvedValue(undefined);

            try {
                await groupeController.updateGroup(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(groupeService.updateGroup).toHaveBeenCalledWith({
                    id: "1",
                    id_promo: "promo-2",
                    nom: "Groupe A Modifié",
                    effectifs: 30,
                });
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith({
                    message: "Groupe mis à jour avec succès",
                });
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si l'ID est manquant", async () => {
            mockRequest.body = {
                id_promo: "promo-1",
                nom: "Groupe A",
                effectifs: 25,
            };

            try {
                await groupeController.updateGroup(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(groupeService.updateGroup).not.toHaveBeenCalled();
                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    message: "Tous les champs sont requis.",
                });
            } catch (error) {
                fail(`Le controller devrait gérer la validation: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si id_promo est manquant", async () => {
            mockRequest.body = { id: "1", nom: "Groupe A", effectifs: 25 };

            try {
                await groupeController.updateGroup(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(groupeService.updateGroup).not.toHaveBeenCalled();
                expect(mockStatus).toHaveBeenCalledWith(400);
            } catch (error) {
                fail(`Le controller devrait gérer la validation: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si nom est manquant", async () => {
            mockRequest.body = { id: "1", id_promo: "promo-1", effectifs: 25 };

            try {
                await groupeController.updateGroup(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(groupeService.updateGroup).not.toHaveBeenCalled();
                expect(mockStatus).toHaveBeenCalledWith(400);
            } catch (error) {
                fail(`Le controller devrait gérer la validation: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si effectifs est manquant", async () => {
            mockRequest.body = { id: "1", id_promo: "promo-1", nom: "Groupe A" };

            try {
                await groupeController.updateGroup(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(groupeService.updateGroup).not.toHaveBeenCalled();
                expect(mockStatus).toHaveBeenCalledWith(400);
            } catch (error) {
                fail(`Le controller devrait gérer la validation: ${error}`);
            }
        });

        it("devrait retourner une erreur 404 si le groupe n'existe pas", async () => {
            mockRequest.body = {
                id: "999",
                id_promo: "promo-1",
                nom: "Groupe A",
                effectifs: 25,
            };
            const mockError: any = new Error("Groupe avec l'ID 999 non trouvé");
            mockError.statusCode = 404;

            (groupeService.updateGroup as jest.Mock).mockRejectedValue(mockError);

            try {
                await groupeController.updateGroup(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "Groupe avec l'ID 999 non trouvé",
                });
            } catch (error) {
                fail(`Le controller devrait gérer l'erreur 404: ${error}`);
            }
        });

        it("devrait retourner une erreur 409 si le nom existe déjà pour cette promo", async () => {
            mockRequest.body = {
                id: "1",
                id_promo: "promo-1",
                nom: "Groupe B",
                effectifs: 25,
            };
            const mockError: any = new Error("Un groupe portant ce nom existe déjà pour cette promotion.");
            mockError.statusCode = 409;

            (groupeService.updateGroup as jest.Mock).mockRejectedValue(mockError);

            try {
                await groupeController.updateGroup(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(409);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "Un groupe portant ce nom existe déjà pour cette promotion.",
                });
            } catch (error) {
                fail(`Le controller devrait gérer l'erreur 409: ${error}`);
            }
        });

        it("devrait throw si deadlock détecté", async () => {
            mockRequest.body = {
                id: "1",
                id_promo: "promo-1",
                nom: "Groupe A",
                effectifs: 25,
            };
            const mockError = new Error("deadlock detected");

            (groupeService.updateGroup as jest.Mock).mockRejectedValue(mockError);

            try {
                await groupeController.updateGroup(
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
                id_promo: "promo-inexistante",
                nom: "Groupe A",
                effectifs: 25,
            };
            const mockError = new Error("update or delete on table \"groupe\" violates foreign key constraint");

            (groupeService.updateGroup as jest.Mock).mockRejectedValue(mockError);

            try {
                await groupeController.updateGroup(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "update or delete on table \"groupe\" violates foreign key constraint",
                });
            } catch (error) {
                expect((error as Error).message).toContain("foreign key");
            }
        });
    });

    describe("deleteGroup", () => {
        it("devrait supprimer un groupe via body.id", async () => {
            mockRequest.body = { id: "1" };

            (groupeService.deleteGroup as jest.Mock).mockResolvedValue(undefined);

            try {
                await groupeController.deleteGroup(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(groupeService.deleteGroup).toHaveBeenCalledWith("1");
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith({
                    message: "Groupe supprimé avec succès",
                });
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait supprimer un groupe via query.id", async () => {
            mockRequest.query = { id: "2" };

            (groupeService.deleteGroup as jest.Mock).mockResolvedValue(undefined);

            try {
                await groupeController.deleteGroup(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(groupeService.deleteGroup).toHaveBeenCalledWith("2");
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith({
                    message: "Groupe supprimé avec succès",
                });
            } catch (error) {
                fail(`Ne devrait pas throw d'erreur: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si l'ID est manquant", async () => {
            mockRequest.body = {};
            mockRequest.query = {};

            try {
                await groupeController.deleteGroup(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(groupeService.deleteGroup).not.toHaveBeenCalled();
                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    message: "Veuillez passer un id (query.id ou body.id).",
                });
            } catch (error) {
                fail(`Le controller devrait gérer la validation: ${error}`);
            }
        });

        it("devrait retourner une erreur 400 si l'ID n'est pas une string", async () => {
            mockRequest.body = { id: 123 };

            try {
                await groupeController.deleteGroup(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(groupeService.deleteGroup).not.toHaveBeenCalled();
                expect(mockStatus).toHaveBeenCalledWith(400);
            } catch (error) {
                fail(`Le controller devrait gérer la validation: ${error}`);
            }
        });

        it("devrait retourner une erreur 404 si le groupe n'existe pas", async () => {
            mockRequest.body = { id: "999" };
            const mockError: any = new Error("Groupe non trouvé");
            mockError.statusCode = 404;

            (groupeService.deleteGroup as jest.Mock).mockRejectedValue(mockError);

            try {
                await groupeController.deleteGroup(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith({ error: "Groupe non trouvé" });
            } catch (error) {
                fail(`Le controller devrait gérer l'erreur 404: ${error}`);
            }
        });

        it("devrait throw si contrainte de clé étrangère violée (spécialités liées)", async () => {
            mockRequest.body = { id: "1" };
            const mockError = new Error("update or delete on table \"groupe\" violates foreign key constraint \"fk_specialite_groupe\"");

            (groupeService.deleteGroup as jest.Mock).mockRejectedValue(mockError);

            try {
                await groupeController.deleteGroup(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    error: "update or delete on table \"groupe\" violates foreign key constraint \"fk_specialite_groupe\"",
                });
            } catch (error) {
                expect((error as Error).message).toContain("foreign key");
            }
        });

        it("devrait throw si erreur de cascade delete", async () => {
            mockRequest.body = { id: "1" };
            const mockError = new Error("Cannot delete record due to dependent records");

            (groupeService.deleteGroup as jest.Mock).mockRejectedValue(mockError);

            try {
                await groupeController.deleteGroup(
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

            (groupeService.deleteGroup as jest.Mock).mockRejectedValue(mockError);

            try {
                await groupeController.deleteGroup(
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