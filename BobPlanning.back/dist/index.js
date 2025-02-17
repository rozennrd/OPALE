"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generateEdtMacro_1 = require("./macro/generateEdtMacro");
const generateDataEdtMicro_1 = require("./micro/generateDataEdtMicro");
const readMaquette_1 = require("./micro/readMaquette");
const generateEdtSquelette_1 = require("./micro/generateEdtSquelette");
const express_1 = __importDefault(require("express"));
const mysql = __importStar(require("mysql2"));
const getDBConfig_1 = __importDefault(require("./database/getDBConfig"));
const path_1 = __importDefault(require("path"));
const generateEdtMicro_1 = require("./micro/generateEdtMicro");
const getLogin_1 = require("./database/getLogin");
const authJwt_1 = __importDefault(require("./middleware/authJwt"));
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const multer = require('multer');
const swaggerJsdoc = require('swagger-jsdoc');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const dbConfig = (0, getDBConfig_1.default)();
const app = (0, express_1.default)();
const PORT = 3000;
app.use(express_1.default.json({ limit: '50mb' }));
app.use(cors());
const connection = mysql.createConnection({
    host: dbConfig.DB_HOST,
    user: dbConfig.DB_USER,
    password: dbConfig.DB_PASSWORD,
    database: dbConfig.DB_NAME,
    port: dbConfig.DB_PORT
});
connection.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
    }
    else {
        console.log('Connecté à la base de données');
    }
});
// Swagger options
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Excel Generation API',
            version: '1.0.0',
            description: 'API to generate Excel files',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
    },
    apis: ['./src/index.ts'], // Met à jour ce chemin si nécessaire
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authentifie un utilisateur et renvoie un cookie JWT
 *     description: Vérifie les identifiants et génère un token JWT stocké dans un cookie sécurisé.
 *     tags:
 *       - Authentification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: L'adresse email de l'utilisateur
 *                 example: "test@example.com"
 *               password:
 *                 type: string
 *                 description: Le mot de passe hashé de l'utilisateur
 *                 example: "$2b$10$1234567890abcdef"
 *     responses:
 *       200:
 *         description: Connexion réussie, cookie envoyé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Connexion réussie"
 *                 userId:
 *                   type: string
 *                   example: "123"
 *       400:
 *         description: Email ou mot de passe manquant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email et mot de passe requis"
 *       401:
 *         description: Identifiants incorrects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Identifiants incorrects"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erreur serveur"
 */
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, getLogin_1.getLogin)(req, res, connection);
    }
    catch (error) {
        console.error('Erreur de connexion:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}));
/**
 * @swagger
 * /getPromosData:
 *   get:
 *     summary: Récupérer les données des promotions
 *     tags:
 *       - DB
 *     description: Retourne toutes les données des promotions.
 *     responses:
 *       200:
 *         description: Une liste d'objets promotionnels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   Name:
 *                     type: string
 *                     example: "ADI1"
 *                   Nombre:
 *                     type: integer
 *                     example: 0
 *                   Periode:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         DateDebutP:
 *                           type: string
 *                           format: date
 *                           example: "2024-01-01"
 *                         DateFinP:
 *                           type: string
 *                           format: date
 *                           example: "2024-01-31"
 *       500:
 *         description: Une erreur est survenue
 */
app.get('/getPromosData', authJwt_1.default.verifyToken, (req, res) => {
    const promosData = {
        DateDeb: "",
        DateFin: "",
        Promos: []
    };
    console.log('Balise 1');
    const sql = 'SELECT Name, Nombre, Periode FROM promosData';
    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        // Conversion de `Periode` en tableau d'objets JSON
        const parsedResults = results.map((promo) => (Object.assign(Object.assign({}, promo), { Periode: promo.Periode ? JSON.parse(promo.Periode) : [] // Conversion de la chaîne JSON
         })));
        promosData.Promos = parsedResults;
        // Récupération des données du calendrier
        const calendarSql = 'SELECT dateDeb, dateFin FROM calendrier LIMIT 1';
        connection.query(calendarSql, (error, calendarResults) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            if (calendarResults.length > 0 && calendarResults[0].dateDeb && calendarResults[0].dateFin) {
                promosData.DateDeb = calendarResults[0].dateDeb.toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).split('/').reverse().join('-'); // Inverser le format pour obtenir yyyy-mm-dd
                promosData.DateFin = calendarResults[0].dateFin.toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).split('/').reverse().join('-'); // Inverser le format pour obtenir yyyy-mm-dd
                console.log('calendarResults datedeb:', calendarResults[0].dateDeb);
                console.log('calendarResults dateFin:', calendarResults[0].dateFin);
                console.log('DateDeb:', promosData.DateDeb);
                console.log('DateFin:', promosData.DateFin);
            }
            res.json(promosData);
        });
    });
});
/**
 * @swagger
 * /setPromosData:
 *   post:
 *     summary: Ajouter des données de promotions
 *     tags:
 *       - DB
 *     description: Cette route permet d'ajouter des données de promotions à la base de données.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               DateDeb:
 *                 type: string
 *                 format: date
 *                 description: La date de début des promotions.
 *                 example: "2024-01-01"  # Exemple de date
 *               DateFin:
 *                 type: string
 *                 format: date
 *                 description: La date de fin des promotions.
 *                 example: "2024-12-31"  # Exemple de date
 *               Promos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     Name:
 *                       type: string
 *                       description: Le nom de la promotion.
 *                       example: "AP5"  # Exemple de nom de promotion
 *                     Nombre:
 *                       type: integer
 *                       description: Le nombre d'éléments de la promotion.
 *                       example: 5  # Exemple de nombre
 *                     Periode:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           DateDebutP:
 *                             type: string
 *                             format: date
 *                             description: La date de début de la période.
 *                             example: "2024-01-01"  # Exemple de date
 *                           DateFinP:
 *                             type: string
 *                             format: date
 *                             description: La date de fin de la période.
 *                             example: "2024-01-31"  # Exemple de date
 *     responses:
 *       200:
 *         description: Données de promotions ajoutées avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Données de promotions ajoutées avec succès."
 *       500:
 *         description: Erreur interne du serveur.
 */
app.post('/setPromosData', authJwt_1.default.verifyToken, (req, res) => {
    const { DateDeb, DateFin, Promos } = req.body;
    console.log('req.body', req.body);
    const dateDeb = DateDeb || null;
    const dateFin = DateFin || null;
    const sql = 'UPDATE calendrier SET dateDeb = ?, dateFin = ?';
    connection.query(sql, [dateDeb, dateFin], (error) => {
        if (error) {
            console.log('1. error', error);
            return res.status(500).json({ error: error.message });
        }
        // Tableau de promesses pour chaque requête de mise à jour de promo
        const updatePromises = Promos.map((promo) => {
            const updatePromosSql = 'UPDATE promosData SET Nombre = ?, Periode = ? WHERE Name = ?';
            return new Promise((resolve, reject) => {
                connection.query(updatePromosSql, [promo.Nombre, JSON.stringify(promo.Periode), promo.Name], (error) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve();
                });
            });
        });
        // Attendre que toutes les requêtes soient terminées avant d'envoyer une réponse
        Promise.all(updatePromises)
            .then(() => {
            res.json({ DateDeb, DateFin, Promos });
        })
            .catch((error) => {
            console.log('2. error', error);
            res.status(500).json({ error: error.message });
        });
    });
});
/**
 * @swagger
 * /getProfsData:
 *   get:
 *     summary: Récupérer les informations des professeurs
 *     tags:
 *       - DB
 *     description: Retourne toutes les informations des professeurs.
 *     responses:
 *       200:
 *         description: Une liste d'objets professeurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Dupont"
 *                   type:
 *                     type: string
 *                     enum: [EXT, INT]
 *                     example: "INT"
 *                   dispo:
 *                     type: string
 *                     example: "{\"lundiMatin\": true, \"lundiAprem\": false, ...}"
 *       500:
 *         description: Une erreur est survenue
 */
app.get('/getProfsData', authJwt_1.default.verifyToken, (req, res) => {
    const sql = 'SELECT id, name, type, dispo FROM Professeurs';
    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results);
    });
});
/**
 * @swagger
 * /setProfsData:
 *   post:
 *     summary: Ajouter ou mettre à jour les informations des professeurs
 *     tags:
 *       - DB
 *     description: Cette route permet d'ajouter ou de mettre à jour les informations des professeurs dans la base de données.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: L'identifiant du professeur (optionnel pour l'ajout)
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: Le nom du professeur
 *                   example: "Dupont"
 *                 type:
 *                   type: string
 *                   enum: [EXT, INT]
 *                   description: Le type du professeur
 *                   example: "INT"
 *                 dispo:
 *                   type: string
 *                   description: Les disponibilités du professeur au format JSON
 *                   example: "{\"lundiMatin\": true, \"lundiAprem\": false, ...}"
 *     responses:
 *       200:
 *         description: Informations du professeur ajoutées ou mises à jour avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Informations du professeur mises à jour avec succès."
 *                 insertedIds:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   description: Liste des IDs des nouveaux professeurs insérés.
 *       500:
 *         description: Erreur interne du serveur.
 */
app.post('/setProfsData', authJwt_1.default.verifyToken, (req, res) => {
    const insertedIds = [];
    const updatePromises = req.body.map((prof) => {
        return new Promise((resolve, reject) => {
            if (prof.id) {
                // Si un ID est fourni, mettre à jour le professeur existant
                const updateSql = 'UPDATE Professeurs SET name = ?, type = ?, dispo = ? WHERE id = ?';
                connection.query(updateSql, [prof.name, prof.type, prof.dispo, prof.id], (error) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve();
                });
            }
            else {
                // Sinon, ajouter un nouveau professeur
                const insertSql = 'INSERT INTO Professeurs (name, type, dispo) VALUES (?, ?, ?)';
                connection.query(insertSql, [prof.name, prof.type, prof.dispo], (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    insertedIds.push(results.insertId);
                    resolve();
                });
            }
        });
    });
    // Attendre que toutes les requêtes soient terminées avant d'envoyer une réponse
    Promise.all(updatePromises)
        .then(() => {
        res.json({ message: 'Informations des professeurs mises à jour avec succès.', insertedIds });
    })
        .catch((error) => {
        res.status(500).json({ error: error.message });
    });
});
/**
 * @swagger
 * /generateEdtMacro:
 *   post:
 *     summary: Generate an Excel file based on provided data
 *     tags:
 *       - Macro
 *     description: Returns an Excel file for the provided date range and promotions data.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               DateDeb:
 *                 type: string
 *                 format: date
 *                 description: The start date for the data
 *                 example: "2024-08-19"
 *               DateFin:
 *                 type: string
 *                 format: date
 *                 description: The end date for the data
 *                 example: "2025-08-27"
 *               Promos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     Name:
 *                       type: string
 *                       description: The name of the promo
 *                     Nombre:
 *                       type: integer
 *                       description: The number associated with the promo
 *                     Periode:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           DateDebutP:
 *                             type: string
 *                             format: date
 *                             description: Start date of the period
 *                           DateFinP:
 *                             type: string
 *                             format: date
 *                             description: End date of the period
 *     responses:
 *       200:
 *         description: The Excel file was generated successfully
 *       400:
 *         description: Missing or invalid data
 *       500:
 *         description: Internal server error
 */
app.post('/generateEdtMacro', authJwt_1.default.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { DateDeb, DateFin, Promos } = req.body;
        if (!DateDeb || !DateFin || !Promos) {
            res.status(400).send('Missing startDate, endDate or Promos');
            return;
        }
        const start = new Date(DateDeb);
        const end = new Date(DateFin);
        const workbook = yield (0, generateEdtMacro_1.generateEdtMacro)({ DateDeb: start, DateFin: end, Promos: Promos });
        res.status(200).json({
            message: 'Excel file generated and saved on the server',
            fileUrl: `http://localhost:${PORT}/download/EdtMacro`,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).send('Internal server error' + error);
    }
}));
/**
 * @swagger
 * /download/EdtMacro:
 *  get:
 *     summary: Download excel macro file
 *     tags:
 *       - Macro
 */
app.get('/download/EdtMacro', authJwt_1.default.verifyToken, (req, res) => {
    const filePath = path_1.default.join(__dirname, '..', 'files', 'EdtMacro.xlsx');
    res.download(filePath, 'EdtMacro.xlsx', (err) => {
        if (err) {
            console.error('Erreur lors du téléchargement du fichier:', err);
            res.status(500).send('Erreur lors du téléchargement du fichier');
        }
    });
});
/**
 * @swagger
 * /readMaquette:
 *   post:
 *     summary: Read an Excel file and return UE and course data
 *     tags:
 *       - Maquette
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Successfully read the Excel file and returned UE and course data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 UE:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                 cours:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       UE:
 *                         type: string
 *                       semestrePeriode:
 *                         type: string
 *                       heure:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: number
 *                             coursMagistral:
 *                               type: number
 *                             coursInteractif:
 *                               type: number
 *                             td:
 *                               type: number
 *                             tp:
 *                               type: number
 *                             autre:
 *                               type: number
 *       400:
 *         description: No file was uploaded
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Aucun fichier n'a été téléchargé
 *       500:
 *         description: Internal server error while reading the file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erreur lors de la lecture du fichier Excel
 *                 error:
 *                   type: string
 */
app.post('/readMaquette', authJwt_1.default.verifyToken, upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return res.status(400).send('Aucun fichier n\'a été téléchargé');
    }
    try {
        let data;
        data = yield (0, readMaquette_1.readMaquette)(req.file.buffer);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: 'Erreur lors de la lecture du fichier Excel', error });
    }
}));
/**
 * @swagger
 * /generateEdtMicro:
 *  post:
 *     summary: Generate excel micro file
 *     tags:
 *       - Micro
 *     requestBody:
 *       required: true
 */
app.post('/generateEdtMicro', authJwt_1.default.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filePath = yield (0, generateEdtMicro_1.generateEdtMicro)(connection);
        res.status(200).json({
            message: 'Excel file generated and saved on the server',
            filePath,
        });
    }
    catch (error) {
        res.status(500).send('Internal server error: ' + error);
    }
}));
/**
 * @swagger
 * /download/EdtMicro:
 *  get:
 *     summary: Download excel micro file
 *     tags:
 *       - Micro
 */
app.get('/download/EdtMicro', authJwt_1.default.verifyToken, (req, res) => {
    const filePath = path_1.default.join(__dirname, '..', 'files', 'EdtMicro.xlsx');
    res.download(filePath, 'EdtMicro.xlsx', (err) => {
        if (err) {
            console.error('Erreur lors du téléchargement du fichier:', err);
            res.status(500).send('Erreur lors du téléchargement du fichier');
        }
    });
});
/**
 * @swagger
 * /generateEdtSquelette:
 *   post:
 *     summary: Generate an Excel timetable skeleton based on provided data
 *     description: Returns an Excel file representing the structure of a timetable, using the provided classes and their respective courses.
 *     tags:
 *       - Test
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 dateDebut:
 *                   type: string
 *                   format: date-time
 *                   description: Start date of the timetable
 *                   example: "2024-01-01T00:00:00.000Z"
 *                 promos:
 *                   type: array
 *                   description: Array of classes with schedules
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: Name of the class
 *                         example: "ADI 1"
 *                       semaine:
 *                         type: array
 *                         description: Weekly schedule with courses
 *                         items:
 *                           type: object
 *                           properties:
 *                             jour:
 *                               type: string
 *                               description: Day
 *                               example: "Lundi"
 *                             enCours:
 *                               type: boolean
 *                               description: Indicates if courses are scheduled on this day
 *                             message:
 *                               type: string
 *                               description: Additional message or note for the day
 *                             cours:
 *                               type: array
 *                               description: List of courses scheduled for the day
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   matiere:
 *                                     type: string
 *                                     description: Subject of the course
 *                                     example: "Mathématiques"
 *                                   heureDebut:
 *                                     type: string
 *                                     description: Start time of the course
 *                                     example: "09h"
 *                                   heureFin:
 *                                     type: string
 *                                     description: End time of the course
 *                                     example: "11h30"
 *                                   professeur:
 *                                     type: string
 *                                     description: Teacher of the course
 *                                     example: "Mme Dupont"
 *                                   salleDeCours:
 *                                     type: string
 *                                     description: Room where the course is held
 *                                     example: "Salle 101"
 *     responses:
 *       200:
 *         description: The Excel file was generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Excel file generated and saved on the server"
 *                 filePath:
 *                   type: string
 *                   example: "../files/EdtSquelette.xlsx"
 *       400:
 *         description: Missing or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Missing classes"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Internal server error"
 */
app.post('/generateEdtSquelette', authJwt_1.default.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const edtMicroArray = req.body;
        // Check if edtMicroArray is an array of objects
        if (!Array.isArray(edtMicroArray)) {
            res.status(400).send('Invalid data format: Expected an array of timetable entries.');
            return;
        }
        // Validate structure of each object in edtMicroArray
        const isValid = edtMicroArray.every((edtMicro) => edtMicro.dateDebut &&
            Array.isArray(edtMicro.promos) &&
            edtMicro.promos.every((promo) => promo.name &&
                Array.isArray(promo.semaine) &&
                promo.semaine.every((semaine) => semaine.jour &&
                    typeof semaine.enCours === 'boolean' &&
                    Array.isArray(semaine.cours) &&
                    semaine.cours.every((cours) => cours.matiere &&
                        cours.heureDebut &&
                        cours.heureFin &&
                        cours.professeur &&
                        cours.salleDeCours))));
        if (!isValid) {
            res.status(400).send('Invalid data: Ensure EdtMicro structure follows the required format.');
            return;
        }
        // Call function to generate the Excel file
        const filePath = yield (0, generateEdtSquelette_1.generateEdtSquelette)(edtMicroArray);
        res.status(200).json({
            message: 'Excel file generated and saved on the server',
            filePath,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Internal server error: ' + error);
    }
}));
/**
 * @swagger
 * /generateDataEdtMicro:
 *   post:
 *     summary: Génère les données EdtMicro basées sur les données macro et maquette
 *     description: Retourne un tableau d'objets EdtMicro contenant les informations de promotion et de semaine.
 *     tags:
 *       - Test
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               macro:
 *                 $ref: '#/components/schemas/EdtMacroData'
 *     responses:
 *       200:
 *         description: Données EdtMicro générées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EdtMicro'
 *       500:
 *         description: Erreur lors de la génération des données EdtMicro
 *
 * components:
 *   schemas:
 *     EdtMacroData:
 *       type: object
 *       properties:
 *         DateDeb:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *         DateFin:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
 *         Promos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Promos'
 *
 *     Promos:
 *       type: object
 *       properties:
 *         Name:
 *           type: string
 *           example: "Promo 2024"
 *         i:
 *           type: number
 *           example: 1
 *         Nombre:
 *           type: number
 *           example: 30
 *         Periode:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Periode'
 *
 *     Periode:
 *       type: object
 *       properties:
 *         DateDebutP:
 *           type: string
 *           format: date
 *           example: "2024-09-01"
 *         DateFinP:
 *           type: string
 *           format: date
 *           example: "2024-12-15"
 *         nbSemaineP:
 *           type: number
 *           example: 15
 *
 *     EdtMicro:
 *       type: object
 *       properties:
 *         dateDebut:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T00:00:00.000Z"
 *         promos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Promo 2024"
 *               semaine:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T00:00:00.000Z"
 *                     cours:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Algèbre Linéaire"
 *                           type:
 *                             type: string
 *                             example: "Cours Magistral"
 *                           heure:
 *                             type: number
 *                             example: 2
 */
app.post('/generateDataEdtMicro', authJwt_1.default.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { macro } = req.body;
        const result = yield (0, generateDataEdtMicro_1.generateDataEdtMicro)(macro);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Erreur lors de la génération des données EdtMicro', error });
    }
}));
/**
 * @swagger
 * /getSallesData:
 *   get:
 *     summary: Récupérer les données des salles
 *     tags:
 *       - Salles
 *     description: Retourne toutes les données des salles disponibles.
 *     responses:
 *       200:
 *         description: Une liste d'objets contenant les informations des salles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Salle 101"
 *                   capacity:
 *                     type: integer
 *                     example: 30
 *       500:
 *         description: Une erreur est survenue
 */
app.get('/getSallesData', authJwt_1.default.verifyToken, (req, res) => {
    const sql = 'SELECT * FROM Salles';
    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.json(results);
    });
});
/**
 * @swagger
 * /setSallesData:
 *   post:
 *     summary: Ajouter une nouvelle salle
 *     tags:
 *       - Salles
 *     description: Ajoute une nouvelle salle à la base de données.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Le nom de la salle.
 *                 example: "Salle 102"
 *               capacity:
 *                 type: integer
 *                 description: La capacité maximale de la salle.
 *                 example: 25
 *     responses:
 *       201:
 *         description: Salle ajoutée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Salle ajoutée avec succès"
 *       500:
 *         description: Erreur interne du serveur.
 */
app.post('/setSallesData', authJwt_1.default.verifyToken, (req, res) => {
    const { name, type, capacite } = req.body;
    const sql = 'INSERT INTO Salles (name, type, capacite) VALUES (?, ?, ?)';
    connection.query(sql, [name, type, capacite], (error) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.status(201).json({ message: 'Salle ajoutée avec succès' });
    });
});
/**
 * @swagger
 * /updateSalle:
 *   put:
 *     summary: Mettre à jour une salle existante
 *     tags:
 *       - Salles
 *     description: Met à jour les informations d'une salle spécifique.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: L'ID de la salle à mettre à jour.
 *                 example: 1
 *               name:
 *                 type: string
 *                 description: Le nouveau nom de la salle.
 *                 example: "Salle Informatique"
 *               capacity:
 *                 type: integer
 *                 description: La nouvelle capacité de la salle.
 *                 example: 40
 *     responses:
 *       200:
 *         description: Salle mise à jour avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Salle mise à jour avec succès"
 *       404:
 *         description: Salle non trouvée.
 *       500:
 *         description: Erreur interne du serveur.
 */
app.put('/updateSalle', authJwt_1.default.verifyToken, (req, res) => {
    const { id, name, capacite, type } = req.body;
    if (!id || !name || !capacite || !type) {
        res.status(400).json({ message: 'Tous les champs sont requis.' });
        return;
    }
    const sql = 'UPDATE Salles SET name = ?, capacite = ?, type = ? WHERE id = ?';
    connection.query(sql, [name, capacite, type, id], (error, result) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
            return;
        }
        const affectedRows = result.affectedRows;
        if (affectedRows === 0) {
            res.status(404).json({ message: `Salle avec l'ID ${id} non trouvée` });
            return;
        }
        res.json({ message: 'Salle mise à jour avec succès' });
    });
});
/**
 * @swagger
 * /deleteSalle:
 *   delete:
 *     summary: Supprimer une salle
 *     tags:
 *       - Salles
 *     description: Supprime une salle spécifique de la base de données.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: L'ID de la salle à supprimer.
 *     responses:
 *       200:
 *         description: Salle supprimée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Salle supprimée avec succès"
 *       404:
 *         description: Salle non trouvée.
 *       500:
 *         description: Erreur interne du serveur.
 */
app.delete('/deleteSalle', authJwt_1.default.verifyToken, (req, res) => {
    const { id } = req.query;
    const sql = 'DELETE FROM Salles WHERE id = ?';
    connection.query(sql, [id], (error, result) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        const affectedRows = Array.isArray(result) ? result[0].affectedRows : result.affectedRows;
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Salle non trouvée' });
        }
        res.json({ message: 'Salle supprimée avec succès' });
    });
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
});
exports.default = app;
