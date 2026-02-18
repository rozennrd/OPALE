import { Request, Response } from "express";
import { cycleController } from "../src/api/controllers/cycleController";
import { cycleService } from "../src/domain/services/cycleService";

// Mock du service
jest.mock("../src/domain/services/cycleService");

describe("cycleController", () => {
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

        // Mock console.error pour éviter le bruit dans les logs
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        jest.clearAllMocks();
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    describe("getCycles", () => {
        it("devrait retourner tous les cycles avec succès", async () => {
            const mockCycles = [
                { id: "1", nom: "ADI", type: "Initial" },
                { id: "2", nom: "ISEN", type: "Apprentissage" },
            ];

            (cycleService.getCycles as jest.Mock).mockResolvedValue(mockCycles);

            await cycleController.getCycles(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(cycleService.getCycles).toHaveBeenCalledTimes(1);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(mockCycles);
        });

        it("devrait gérer les erreurs avec détails", async () => {
            const mockError = new Error("Connection timeout");
            (cycleService.getCycles as jest.Mock).mockRejectedValue(mockError);

            try {
                await cycleController.getCycles(
                    mockRequest as Request,
                    mockResponse as Response
                );

                // Si le controller ne gère pas l'erreur correctement
                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({ error: "Connection timeout" });
            } catch (error) {
                // Si une erreur échappe au controller (bug)
                fail(`Erreur non gérée par le controller: ${error}`);
            }
        });

        it("devrait gérer les erreurs de connexion à la base de données", async () => {
            const mockError = new Error("Connection timeout");
            (cycleService.getCycles as jest.Mock).mockRejectedValue(mockError);

            await cycleController.getCycles(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: "Connection timeout" });
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error getCycles:", mockError);
        });

        it("devrait gérer les erreurs de requête SQL", async () => {
            const mockError = new Error("syntax error at or near \"SELCT\"");
            (cycleService.getCycles as jest.Mock).mockRejectedValue(mockError);

            await cycleController.getCycles(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: "syntax error at or near \"SELCT\"" });
        });

        it("devrait gérer les TypeError (données corrompues)", async () => {
            const mockError = new TypeError("Cannot read property 'map' of undefined");
            (cycleService.getCycles as jest.Mock).mockRejectedValue(mockError);

            await cycleController.getCycles(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: "Cannot read property 'map' of undefined" });
        });
    });

    describe("getCycleTypes", () => {
        it("devrait retourner tous les types de cycle", async () => {
            const mockTypes = [
                { type: "Initial" },
                { type: "Apprentissage" },
            ];

            (cycleService.getCycleTypes as jest.Mock).mockResolvedValue(mockTypes);

            await cycleController.getCycleTypes(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(cycleService.getCycleTypes).toHaveBeenCalledTimes(1);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(mockTypes);
        });

        it("devrait gérer les erreurs de type enum inexistant", async () => {
            const mockError = new Error("type \"type_cycle\" does not exist");
            (cycleService.getCycleTypes as jest.Mock).mockRejectedValue(mockError);

            await cycleController.getCycleTypes(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                error: "type \"type_cycle\" does not exist",
            });
        });

        it("devrait gérer les erreurs de permission", async () => {
            const mockError = new Error("permission denied for table cycle");
            (cycleService.getCycleTypes as jest.Mock).mockRejectedValue(mockError);

            await cycleController.getCycleTypes(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                error: "permission denied for table cycle",
            });
        });
    });

    describe("getCycleById", () => {
        it("devrait retourner un cycle par son ID", async () => {
            const mockCycle = { id: "1", nom: "ISEN", type: "Apprentissage" };
            mockRequest.query = { id: "1" };

            (cycleService.getCycleById as jest.Mock).mockResolvedValue(mockCycle);

            await cycleController.getCycleById(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(cycleService.getCycleById).toHaveBeenCalledWith("1");
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(mockCycle);
        });

        it("devrait gérer le cas où l'ID est undefined", async () => {
            mockRequest.query = {};

            const mockError: any = new Error("Cycle non trouvé");
            mockError.statusCode = 400;
            (cycleService.getCycleById as jest.Mock).mockRejectedValue(mockError);

            await cycleController.getCycleById(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(cycleService.getCycleById).toHaveBeenCalledWith("undefined");
            expect(mockStatus).toHaveBeenCalledWith(404);
        });

        it("devrait retourner une erreur 404 si le cycle n'existe pas", async () => {
            mockRequest.query = { id: "999" };
            const mockError: any = new Error("Cycle non trouvé");
            mockError.statusCode = 404;

            (cycleService.getCycleById as jest.Mock).mockRejectedValue(mockError);

            await cycleController.getCycleById(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ error: "Cycle non trouvé" });
        });

        it("devrait gérer les erreurs d'ID au format invalide", async () => {
            mockRequest.query = { id: "abc-invalid-uuid" };
            const mockError = new Error("invalid input syntax for type uuid");

            (cycleService.getCycleById as jest.Mock).mockRejectedValue(mockError);

            await cycleController.getCycleById(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: "invalid input syntax for type uuid" });
        });

        it("devrait gérer les erreurs de timeout", async () => {
            mockRequest.query = { id: "1" };
            const mockError = new Error("Query read timeout");

            (cycleService.getCycleById as jest.Mock).mockRejectedValue(mockError);

            await cycleController.getCycleById(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: "Query read timeout" });
        });

        it("devrait gérer les ReferenceError", async () => {
            mockRequest.query = { id: "1" };
            const mockError = new ReferenceError("cycleMapper is not defined");

            (cycleService.getCycleById as jest.Mock).mockRejectedValue(mockError);

            await cycleController.getCycleById(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: "cycleMapper is not defined" });
        });
    });

    describe("addCycle", () => {
        it("devrait ajouter un cycle avec succès", async () => {
            mockRequest.body = { nom: "ISEN", type: "Apprentissage" };
            const mockResult = { id: "3" };

            (cycleService.addCycle as jest.Mock).mockResolvedValue(mockResult);

            await cycleController.addCycle(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(cycleService.addCycle).toHaveBeenCalledWith({
                nom: "ISEN",
                type: "Apprentissage",
            });
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith({
                message: "Cycle ajouté avec succès",
                insertedId: "3",
            });
        });

        it("devrait retourner une erreur 400 si le nom est manquant", async () => {
            mockRequest.body = { type: "Apprentissage" };

            await cycleController.addCycle(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(cycleService.addCycle).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                message: "Tous les champs sont requis.",
            });
        });

        it("devrait retourner une erreur 400 si le type est manquant", async () => {
            mockRequest.body = { nom: "ISEN" };

            await cycleController.addCycle(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(cycleService.addCycle).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                message: "Tous les champs sont requis.",
            });
        });

        it("devrait gérer les erreurs de contrainte unique (duplicate)", async () => {
            mockRequest.body = { nom: "ISEN", type: "Apprentissage" };
            const mockError = new Error("duplicate key value violates unique constraint \"cycle_nom_key\"");

            (cycleService.addCycle as jest.Mock).mockRejectedValue(mockError);

            await cycleController.addCycle(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                error: "duplicate key value violates unique constraint \"cycle_nom_key\""
            });
        });

        it("devrait gérer les erreurs de type invalide pour l'enum", async () => {
            mockRequest.body = { nom: "ISEN", type: "invalide" };
            const mockError = new Error("invalid input value for enum type_cycle: \"invalide\"");

            (cycleService.addCycle as jest.Mock).mockRejectedValue(mockError);

            await cycleController.addCycle(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                error: "invalid input value for enum type_cycle: \"invalide\""
            });
        });

        it("devrait gérer les erreurs de violation de contrainte NOT NULL", async () => {
            mockRequest.body = { nom: "ISEN", type: "Apprentissage" };
            const mockError = new Error("null value in column \"nom\" violates not-null constraint");

            (cycleService.addCycle as jest.Mock).mockRejectedValue(mockError);

            await cycleController.addCycle(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                error: "null value in column \"nom\" violates not-null constraint"
            });
        });

        it("devrait gérer les erreurs de dépassement de longueur", async () => {
            mockRequest.body = { nom: "A".repeat(300), type: "Apprentissage" };
            const mockError = new Error("value too long for type character varying(255)");

            (cycleService.addCycle as jest.Mock).mockRejectedValue(mockError);

            await cycleController.addCycle(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                error: "value too long for type character varying(255)"
            });
        });

        it("devrait gérer les erreurs de transaction rollback", async () => {
            mockRequest.body = { nom: "ISEN", type: "Apprentissage" };
            const mockError = new Error("current transaction is aborted, commands ignored until end of transaction block");

            (cycleService.addCycle as jest.Mock).mockRejectedValue(mockError);

            await cycleController.addCycle(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                error: "current transaction is aborted, commands ignored until end of transaction block"
            });
        });
    });

    describe("updateCycle", () => {
        it("devrait mettre à jour un cycle avec succès", async () => {
            mockRequest.body = {
                id: "1",
                nom: "ISEN",
                type: "Apprentissage",
            };

            (cycleService.updateCycle as jest.Mock).mockResolvedValue(undefined);

            await cycleController.updateCycle(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(cycleService.updateCycle).toHaveBeenCalledWith({
                id: "1",
                nom: "ISEN",
                type: "Apprentissage",
            });
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                message: "Cycle mis à jour avec succès",
            });
        });

        it("devrait retourner une erreur 400 si l'ID est manquant", async () => {
            mockRequest.body = { nom: "ISEN", type: "Apprentissage" };

            await cycleController.updateCycle(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(cycleService.updateCycle).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                message: "Tous les champs sont requis.",
            });
        });

        it("devrait retourner une erreur 400 si le nom est manquant", async () => {
            mockRequest.body = { id: "1", type: "Apprentissage" };

            await cycleController.updateCycle(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(cycleService.updateCycle).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(400);
        });

        it("devrait retourner une erreur 400 si le type est manquant", async () => {
            mockRequest.body = { id: "1", nom: "ISEN" };

            await cycleController.updateCycle(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(cycleService.updateCycle).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(400);
        });

        it("devrait retourner une erreur 404 si le cycle n'existe pas", async () => {
            mockRequest.body = { id: "999", nom: "ISEN", type: "Apprentissage" };
            const mockError: any = new Error("Cycle avec l'ID 999 non trouvé");
            mockError.statusCode = 404;

            (cycleService.updateCycle as jest.Mock).mockRejectedValue(mockError);

            await cycleController.updateCycle(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                error: "Cycle avec l'ID 999 non trouvé",
            });
        });

        it("devrait gérer les conflits de mise à jour (optimistic locking)", async () => {
            mockRequest.body = { id: "1", nom: "ISEN", type: "Apprentissage" };
            const mockError = new Error("Record has been modified by another user");

            (cycleService.updateCycle as jest.Mock).mockRejectedValue(mockError);

            await cycleController.updateCycle(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                error: "Record has been modified by another user"
            });
        });

        it("devrait gérer les erreurs de deadlock", async () => {
            mockRequest.body = { id: "1", nom: "ISEN", type: "Apprentissage" };
            const mockError = new Error("deadlock detected");

            (cycleService.updateCycle as jest.Mock).mockRejectedValue(mockError);

            await cycleController.updateCycle(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: "deadlock detected" });
        });

        it("devrait gérer les erreurs de contrainte de clé étrangère", async () => {
            mockRequest.body = { id: "1", nom: "ISEN", type: "Apprentissage" };
            const mockError = new Error("update or delete on table \"cycle\" violates foreign key constraint");

            (cycleService.updateCycle as jest.Mock).mockRejectedValue(mockError);

            await cycleController.updateCycle(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                error: "update or delete on table \"cycle\" violates foreign key constraint"
            });
        });
    });

    describe("deleteCycle", () => {
        it("devrait supprimer un cycle via body.id", async () => {
            mockRequest.body = { id: "1" };

            (cycleService.deleteCycle as jest.Mock).mockResolvedValue(undefined);

            await cycleController.deleteCycle(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(cycleService.deleteCycle).toHaveBeenCalledWith("1");
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                message: "Cycle supprimé avec succès",
            });
        });

        it("devrait supprimer un cycle via query.id", async () => {
            mockRequest.query = { id: "2" };

            (cycleService.deleteCycle as jest.Mock).mockResolvedValue(undefined);

            await cycleController.deleteCycle(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(cycleService.deleteCycle).toHaveBeenCalledWith("2");
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                message: "Cycle supprimé avec succès",
            });
        });

        it("devrait retourner une erreur 400 si l'ID est manquant", async () => {
            mockRequest.body = {};
            mockRequest.query = {};

            await cycleController.deleteCycle(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(cycleService.deleteCycle).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                message: "L'id est requis (body.id ou query.id).",
            });
        });

        it("devrait retourner une erreur 400 si l'ID n'est pas une string", async () => {
            mockRequest.body = { id: 123 };

            await cycleController.deleteCycle(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(cycleService.deleteCycle).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(400);
        });

        it("devrait retourner une erreur 404 si le cycle n'existe pas", async () => {
            mockRequest.body = { id: "999" };
            const mockError: any = new Error("Cycle non trouvé");
            mockError.statusCode = 404;

            (cycleService.deleteCycle as jest.Mock).mockRejectedValue(mockError);

            await cycleController.deleteCycle(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ error: "Cycle non trouvé" });
        });

        it("devrait gérer les erreurs de contrainte de clé étrangère lors de la suppression", async () => {
            mockRequest.body = { id: "1" };
            const mockError = new Error("update or delete on table \"cycle\" violates foreign key constraint \"fk_cours_cycle\"");

            (cycleService.deleteCycle as jest.Mock).mockRejectedValue(mockError);

            await cycleController.deleteCycle(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                error: "update or delete on table \"cycle\" violates foreign key constraint \"fk_cours_cycle\""
            });
        });

        it("devrait gérer les erreurs de cascade delete", async () => {
            mockRequest.body = { id: "1" };
            const mockError = new Error("Cannot delete record due to dependent records");

            (cycleService.deleteCycle as jest.Mock).mockRejectedValue(mockError);

            await cycleController.deleteCycle(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                error: "Cannot delete record due to dependent records"
            });
        });

        it("devrait gérer les erreurs de verrou (lock wait timeout)", async () => {
            mockRequest.body = { id: "1" };
            const mockError = new Error("Lock wait timeout exceeded; try restarting transaction");

            (cycleService.deleteCycle as jest.Mock).mockRejectedValue(mockError);

            await cycleController.deleteCycle(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                error: "Lock wait timeout exceeded; try restarting transaction"
            });
        });
    });
});