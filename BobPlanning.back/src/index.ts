import { generateEdtMacro } from './macro/generateEdtMacro';
import { generateDataEdtMicro } from './micro/generateDataEdtMicro';
import { readMaquette } from './micro/readMaquette';
import { MaquetteData } from './types/MaquetteData';
import { EdtMacroData } from './types/EdtMacroData';
import { generateEdtSquelette } from './micro/generateEdtSquelette';
import express, { Request, Response } from 'express';
import getDBConfig from './database/getDBConfig';
import path from 'path';
import { EdtMicro } from './types/EdtMicroData';
import { generateEdtMicro } from './micro/generateEdtMicro';
import { getLogin } from './database/getLogin';
import authJwt from './middleware/authJwt';
import { pool } from './database/pool';

import { Periode, Promos } from "./types/EdtMacroData";
import salleRoutes from './api/routes/salleRoutes';
import cycleRoutes from "./api/routes/cycleRoutes";
import groupeRoutes from './api/routes/groupeRoutes';
import promotionRoutes from './api/routes/promotionRoutes';
import matiereRoutes from "./api/routes/matiereRoutes";
import profRoutes from "./api/routes/profRoutes";
import specialiteRoutes from "./api/routes/specialiteRoutes";
import maquetteRoutes from './api/routes/maquetteRoutes';

require('dotenv').config();

const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const multer = require('multer');
const swaggerJsdoc = require('swagger-jsdoc');

const storage = multer.memoryStorage();
const upload = multer({ storage });

import dotenv from "dotenv";
import eventRoutes from "./api/routes/eventRoutes";
dotenv.config();

const dbConfig = getDBConfig();

const app = express();
const PORT = 3000;
app.use(express.json({ limit: '50mb' }));
app.use(
    cors({
      origin: function (
          origin: string | undefined,
          callback: (err: Error | null, allow?: string | boolean) => void,
      ) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
          return callback(null, origin || true);
        } else {
          return callback(null, false);
        }
      },
      credentials: true,
    }),
);

pool.connect((err: any, connection: any) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
  } else {
    connection.release(); // Libérer la connexion après vérification
  }
});

app.use('/', salleRoutes);
app.use('/', cycleRoutes);
app.use('/', groupeRoutes);
app.use('/', promotionRoutes);
app.use("/", matiereRoutes);
app.use('/', profRoutes);
app.use('/', specialiteRoutes);
app.use('/', eventRoutes);
app.use('/', maquetteRoutes);

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
 * /verify-auth:
 *   get:
 *     summary: Vérifie si l'utilisateur est authentifié
 *     description: Endpoint léger pour vérifier que le JWT dans le cookie est valide
 *     tags:
 *       - Authentification
 *     responses:
 *       200:
 *         description: Utilisateur authentifié
 *       401:
 *         description: Non authentifié
 */
app.get('/verify-auth', authJwt.verifyToken, (req: Request, res: Response) => {
  res.json({ authenticated: true, userId: (req as any).userId });
});

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
app.post('/login', async (req: Request, res: Response) => {
  try {
    pool.connect(async (err: any, connection: any) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      await getLogin(req, res);
      connection.release(); // Libérer la connexion après vérification
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
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


app.post(
    "/generateEdtMacro",
    authJwt.verifyToken,
    async (req: Request, res: Response) => {
      // Type definitions
      type RawMacroEvent = {
        id_promotion: string;
        datetime_start: string;
        datetime_end: string;
        type: string;
        nom: string;
      };

      try {
        // ========================================
        // 1. Fetch Promotions
        // ========================================
        const promotions = await new Promise<Promos[]>((resolve, reject) => {
          pool.connect((err: any, connection: any) => {
            if (err) {
              return reject(err);
            }

            const sql = `
            SELECT p.id, p.nom, p.effectifs, p.id_cycle, p.date_start, p.date_end, c.type
            FROM promotion p
            INNER JOIN cycle c ON p.id_cycle = c.id
          `;

            connection.query(sql, (error: any, results: any) => {
              connection.release();

              if (error) {
                return reject(error);
              }

              // Normalize results for different drivers
              const normalized = Array.isArray(results)
                  ? results
                  : results?.rows || [];

              resolve(normalized);
            });
          });
        });

        console.log("Promotions récupérées :", promotions);

        // ========================================
        // 2. Fetch Macro Events
        // ========================================
        const eventsMacro = await new Promise<RawMacroEvent[]>((resolve, reject) => {
          pool.connect((err: any, connection: any) => {
            if (err) {
              return reject(err);
            }

            const sql = `
            SELECT 
              p.id as id_promotion, 
              e.datetime_start, 
              e.datetime_end, 
              e.type, 
              e.nom
            FROM event e
            INNER JOIN concerner c ON e.id = c.id_event
            INNER JOIN promotion p ON p.id = c.id_promo
            WHERE e.show_macro = TRUE
              AND e.type IN ('stage', 'mobilite', 'PFE', 'rattrapage', 'entreprise')
            ORDER BY e.nom ASC
          `;

            connection.query(sql, (error: any, results: any) => {
              connection.release();

              if (error) {
                return reject(error);
              }

              // Normalize results for different drivers
              const normalized = Array.isArray(results)
                  ? results
                  : results?.rows || [];

              resolve(normalized);
            });
          });
        });

        console.log("Événements récupérés :", eventsMacro);

        // ========================================
        // 3. Build Promotions with Periods
        // ========================================
        const promotionsWithPeriods: Promos[] = promotions.map((promo) => {
          // Filter events for this promotion
          const promoEvents = eventsMacro.filter(
              (ev) => ev.id_promotion === promo.id
          );

          // Transform to Periode objects and sort
          const promoPeriods: Periode[] = promoEvents
              .map((ev): Periode => ({
                DateDebutP: new Date(ev.datetime_start),
                DateFinP: new Date(ev.datetime_end),
                type: ev.nom,
              }))
              .sort((a, b) => a.DateDebutP.getTime() - b.DateDebutP.getTime());

          return {
            ...promo,
            periode: promoPeriods,
            i: 0,
          };
        });

        console.log("Promotions enrichies :", promotionsWithPeriods);

        // ========================================
        // 4. Define Date Range
        // ========================================
        const start = new Date("2025-09-01");
        const end = new Date("2026-08-31");

        // ========================================
        // 5. Generate Excel
        // ========================================
        await generateEdtMacro({
          DateDeb: start,
          DateFin: end,
          Promos: promotionsWithPeriods,
        });

        // ========================================
        // 6. Send Success Response
        // ========================================
        res.status(200).json({
          message: "Excel généré avec succès",
          fileUrl: "/download/EdtMacro",
        });

      } catch (error: any) {
        console.error("Error in generateEdtMacro:", error);
        res.status(500).json({
          error: "Internal server error",
          message: error.message || "Unknown error occurred",
        });
      }
    }
);


/**
 * @swagger
 * /download/EdtMacro:
 *  get:
 *     summary: Download excel macro file
 *     tags:
 *       - Macro
 */
app.get('/download/EdtMacro', authJwt.verifyToken, (req, res) => {
  const filePath = path.join(__dirname, '..', 'files', 'EdtMacro.xlsx');
  res.download(filePath, 'EdtMacro.xlsx', (err) => {
    if (err) {
      console.error('Erreur lors du téléchargement du fichier:', err);
      res.status(500).send('Erreur lors du téléchargement du fichier');
    }
  });
});

/*========== GENERATION MICRO ==========*/

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
app.post(
    '/readMaquette',
    authJwt.verifyToken,
    upload.single('file'),
    async (req: Request, res: Response): Promise<any> => {
      if (!req.file) {
        return res.status(400).send("Aucun fichier n'a été téléchargé");
      }

      try {
        let data: MaquetteData;
        data = await readMaquette(req.file.buffer);
        res.json(data);
      } catch (error) {
        res
            .status(500)
            .json({ message: 'Erreur lors de la lecture du fichier Excel', error });
      }
    },
);

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
app.post(
    '/generateEdtMicro',
    authJwt.verifyToken,
    async (req: Request, res: Response) => {
      try {
        pool.connect(async (err: any, connection: any) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          const filePath = await generateEdtMicro(connection);
          connection.release(); // Libérer la connexion après vérification
          res.status(200).json({
            message: 'Excel file generated and saved on the server',
            data: filePath,
            fileUrl: `${process.env.VITE_RACINE_FETCHER_URL}/download/EdtMicro`,
          });
        });
      } catch (error) {
        res.status(500).send('Internal server error: ' + error);
      }
    },
);

/**
 * @swagger
 * /download/EdtMicro:
 *  get:
 *     summary: Download excel micro file
 *     tags:
 *       - Micro
 */
app.get('/download/EdtMicro', authJwt.verifyToken, (req, res) => {
  const filePath = path.join(__dirname, '..', 'files', 'EdtMicro.xlsx');
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
app.post(
    '/generateEdtSquelette',
    authJwt.verifyToken,
    async (req: Request, res: Response) => {
      try {
        const edtMicroArray: EdtMicro[] = req.body;

        // Check if edtMicroArray is an array of objects
        if (!Array.isArray(edtMicroArray)) {
          res
              .status(400)
              .send('Invalid data format: Expected an array of timetable entries.');
          return;
        }

        // Validate structure of each object in edtMicroArray
        const isValid = edtMicroArray.every(
            (edtMicro: EdtMicro) =>
                edtMicro.dateDebut &&
                Array.isArray(edtMicro.promos) &&
                edtMicro.promos.every(
                    (promo: any) =>
                        promo.name &&
                        Array.isArray(promo.semaine) &&
                        promo.semaine.every(
                            (semaine: any) =>
                                semaine.jour &&
                                typeof semaine.enCours === 'boolean' &&
                                Array.isArray(semaine.cours) &&
                                semaine.cours.every(
                                    (cours: any) =>
                                        cours.matiere &&
                                        cours.heureDebut &&
                                        cours.heureFin &&
                                        cours.professeur &&
                                        cours.salleDeCours,
                                ),
                        ),
                ),
        );

        if (!isValid) {
          res
              .status(400)
              .send(
                  'Invalid data: Ensure EdtMicro structure follows the required format.',
              );
          return;
        }

        // Call function to generate the Excel file
        const filePath = await generateEdtSquelette(edtMicroArray);

        res.status(200).json({
          message: 'Excel file generated and saved on the server',
          filePath,
        });
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error: ' + error);
      }
    },
);

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
app.post(
    '/generateDataEdtMicro',
    authJwt.verifyToken,
    async (req: Request, res: Response) => {
      try {
        const { macro }: { macro: EdtMacroData } = req.body;

        const result = await generateDataEdtMicro(macro);
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({
          message: 'Erreur lors de la génération des données EdtMicro',
          error,
        });
      }
    },
);

/*========== COURS ==========*/

app.post('/setAllCourses', authJwt.verifyToken, (req, res) => {
  pool.connect((err: any, connection: any) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    connection.beginTransaction((err: any) => {
      if (err) {
        connection.release();
        return res.status(500).json({ error: err.message });
      }

      // Extraire la promo unique des cours
      const promo =
          req.body.courses.length > 0 ? req.body.courses[0].promo : null;

      if (!promo) {
        connection.release();
        return res.status(400).json({ error: 'Aucune promotion fournie' });
      }

      // Supprimer les matières associées à cette promo
      const deleteSql = `DELETE
                               FROM concerner
                               WHERE id_promo = ?`;

      connection.query(deleteSql, [promo], (deleteErr: any) => {
        if (deleteErr) {
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({ error: deleteErr.message });
          });
        }

        // Insérer les nouvelles matières
        const insertPromises = req.body.courses.map(
            (cours: {
              promo: string;
              name: string;
              UE: string;
              Semestre: string;
              Periode: string;
              Prof: string;
              typeSalle: string;
              heure: string;
            }) => {
              return new Promise<void>((resolve, reject) => {
                // Ancienne requête permettant l'update d'une matière si elle existe déjà ou l'insert
                // TODO : À garder jusqu'à ce que la fonction soit fonctionnelle avec la nouvelle base de données
                // const sql = `INSERT INTO Cours (promo, name, UE, Semestre, Periode, Prof, typeSalle, heure)
                //               VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                //               ON DUPLICATE KEY UPDATE
                //               UE = VALUES(UE), Semestre = VALUES(Semestre), Periode = VALUES(Periode),
                //               Prof = VALUES(Prof), typeSalle = VALUES(typeSalle), heure = VALUES(heure)`;

                const sql = `INSERT INTO matiere (id_promo, nom, semestre, volume_horaire)
                                         VALUES (?, ?, ?, ?) ON CONFLICT (id_promo, nom) 
                            DO
                            UPDATE SET
                                semestre = EXCLUDED.semestre,
                                volume_horaire = EXCLUDED.volume_horaire`;
                connection.query(
                    sql,
                    [
                      cours.promo,
                      cours.name,
                      cours.UE,
                      cours.Semestre,
                      cours.Periode,
                      cours.Prof,
                      cours.typeSalle,
                      cours.heure,
                    ],
                    (error: any) => {
                      if (error) {
                        console.error(
                            "Erreur lors de l'insertion/mise à jour :",
                            error,
                        );
                        return reject(error);
                      }
                      resolve();
                    },
                );
              });
            },
        );

        Promise.all(insertPromises)
            .then(() => {
              connection.commit((commitErr: any) => {
                if (commitErr) {
                  return connection.rollback(() => {
                    connection.release();
                    res.status(500).json({ error: commitErr.message });
                  });
                }
                res.json({
                  message:
                      'Matières mises à jour avec succès pour la promo ' + promo,
                });
              });
            })
            .catch((error) => {
              connection.rollback(() => {
                res.status(500).json({ error: error.message });
              });
            })
            .finally(() => {
              connection.release();
            });
      });
    });
  });
});

app.post('/updateCourseProfessor', authJwt.verifyToken, (req, res) => {
  pool.connect((err: any, connection: any) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const updatePromises = req.body.courses.map(
        (cours: {
          promo: string;
          name: string;
          UE: string;
          Semestre: string;
          Periode: string;
          Prof: string;
          typeSalle: string;
          heure: string;
        }) => {
          return new Promise<void>((resolve, reject) => {
            const sql = `UPDATE Cours
                                 SET id_prof = ?
                                 WHERE id_event = ?`;

            connection.query(sql, [cours.Prof, cours.name], (error: any) => {
              if (error) {
                console.error(
                    'Erreur lors de la mise à jour du professeur :',
                    error,
                );
                return reject(error);
              }
              resolve();
            });
          });
        },
    );

    Promise.all(updatePromises)
        .then(() => {
          res.json({ message: 'Professeurs mis à jour avec succès.' });
        })
        .catch((error) => {
          res.status(500).json({ error: error.message });
        })
        .finally(() => {
          connection.release(); // Libérer la connexion après exécution
        });
  });
});

app.get('/getCours', authJwt.verifyToken, (req, res) => {
  pool.connect((err: any, connection: any) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const sql = 'SELECT * FROM Cours'; // Remplace `Cours` par le nom de ta table en base de données

    connection.query(sql, (error: any, results: any) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.json(results);
    });

    connection.release(); // Libérer la connexion après l'exécution
  });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
});

server.timeout = 0;

export default app;
