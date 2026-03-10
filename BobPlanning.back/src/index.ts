import { generateEdtMacro } from './macro/generateEdtMacro';
import { generateDataEdtMicro } from './micro/generateDataEdtMicro';
import { readMaquette } from './micro/readMaquette';
import { MaquetteData } from './types/MaquetteData';
import { EdtMacroData } from './types/EdtMacroData';
import { generateEdtSquelette } from './micro/generateEdtSquelette';
import express, { Request, Response } from 'express';
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
import enseignementRoutes from "./api/routes/enseignementRoutes";
import disponibiliteRoutes from './api/routes/disponibiliteRoutes';
import maquetteRoutes from './api/routes/maquetteRoutes';
import eventRoutes from "./api/routes/eventRoutes";
import localisationRoutes from "./api/routes/localisationRoutes";

require('dotenv').config();

const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const multer = require('multer');
const swaggerJsdoc = require('swagger-jsdoc');
const storage = multer.memoryStorage();
const upload = multer({ storage });
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
app.use('/', matiereRoutes);
app.use('/', profRoutes);
app.use('/', specialiteRoutes);
app.use('/', eventRoutes);
app.use('/', enseignementRoutes);
app.use('/', disponibiliteRoutes);
app.use('/', localisationRoutes);
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


app.post(
    "/generateEdtMacro",
    authJwt.verifyToken,
    async (req: Request, res: Response) => {
      // Type definitions
      type RawMacroEvent = {
        id: string;
        id_promotion: string | null;   // null = event global (pas de promo liée)
        datetime_start: string;
        datetime_end: string;
        type: string;
        nom: string;
        is_external: boolean;
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

        // ========================================
        // 2. Fetch Macro Events
        // ========================================
        const eventsMacroRaw = await new Promise<RawMacroEvent[]>((resolve, reject) => {
          pool.connect((err: any, connection: any) => {
            if (err) {
              return reject(err);
            }

            const sql = `
              SELECT
                e.id,
                c.id_promo as id_promotion,
                e.datetime_start,
                e.datetime_end,
                e.type,
                e.nom,
                e.is_external
              FROM event e
              LEFT JOIN concerner c ON e.id = c.id_event AND c.id_promo IS NOT NULL
              WHERE e.show_macro = TRUE
                AND e.type IN (
                  'Cours', 'Entreprise', 'Examen', 'Reunion', 'Fermeture', 'Soutenance',
                  'JPO', 'Stage', 'Mobilite', 'PFE', 'Rattrapage', 'Conference',
                  'Rentrée', 'Réunion parents', 'Journée Immersion', 'Concours',
                  'Salon', 'Fin des cours', 'Autre'
                )
              ORDER BY e.nom ASC
            `;

            connection.query(sql, (error: any, results: any) => {
              connection.release();
              if (error) return reject(error);
              const normalized = Array.isArray(results) ? results : results?.rows || [];
              resolve(normalized);
            });
          });
        });


        // ========================================
        // 3. Build Promotions with Periods
        // ========================================
        const promotionsWithPeriods: Promos[] = promotions.map((promo) => {
          const promoEvents = eventsMacroRaw.filter(ev => ev.id_promotion === promo.id);

          // Transform to Periode objects and sort
          const promoPeriods: Periode[] = promoEvents
              .map((ev): Periode => ({
                DateDebutP: new Date(ev.datetime_start),
                DateFinP: new Date(ev.datetime_end),
                type: ev.type,   // type de l'event pour la colorisation
              }))
              .sort((a, b) => a.DateDebutP.getTime() - b.DateDebutP.getTime());

          return { ...promo, periode: promoPeriods, i: 0 };
        });

        // ========================================
        // 4. Build EventsMacro (events show_macro = true)
        // Un Map pour regrouper les promos multiples sur un même event
        // ========================================
        const eventMacroMap = new Map<string, { id: string; type: string; nom: string; datetime_start: Date; datetime_end: Date; is_external: boolean; promotions: string[] }>();

        eventsMacroRaw.forEach(ev => {
          if (!eventMacroMap.has(ev.id)) {
            eventMacroMap.set(ev.id, {
              id:             ev.id,
              type:           ev.type,
              nom:            ev.nom,
              datetime_start: new Date(ev.datetime_start),
              datetime_end:   new Date(ev.datetime_end),
              is_external:    ev.is_external,
              promotions:     ev.id_promotion ? [ev.id_promotion] : [],
            });
          } else if (ev.id_promotion) {
            eventMacroMap.get(ev.id)!.promotions.push(ev.id_promotion);
          }
        });

        const eventsMacroList = Array.from(eventMacroMap.values());

        // ========================================
        // 5. Define Date Range
        // ========================================
        const start = new Date("2025-09-01");
        const end = new Date("2026-08-31");

        // ========================================
        // 6. Generate Excel
        // ========================================
        await generateEdtMacro({
          DateDeb:     start,
          DateFin:     end,
          Promos:      promotionsWithPeriods,
          EventsMacro: eventsMacroList,
        });

        // ========================================
        // 7. Send Success Response
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

app.get('/download/EdtMicro', authJwt.verifyToken, (req, res) => {
  const filePath = path.join(__dirname, '..', 'files', 'EdtMicro.xlsx');
  res.download(filePath, 'EdtMicro.xlsx', (err) => {
    if (err) {
      console.error('Erreur lors du téléchargement du fichier:', err);
      res.status(500).send('Erreur lors du téléchargement du fichier');
    }
  });
});

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

app.post('/setAllCourses', authJwt.verifyToken, async (req, res) => {
  pool.connect(async (err: any, connection: any) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    try {
      // Start transaction
      await connection.query('BEGIN');

      // Extraire la promo unique des cours
      const promo =
          req.body.courses.length > 0 ? req.body.courses[0].promo : null;

      if (!promo) {
        await connection.query('ROLLBACK');
        connection.release();
        return res.status(400).json({ error: 'Aucune promotion fournie' });
      }

      // Supprimer les matières associées à cette promo
      const deleteSql = `DELETE FROM concerner WHERE id_promo = $1`;

      await connection.query(deleteSql, [promo]);

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
      } catch (e) { console.log (e)}
   
  });
});


app.get('/getCours', authJwt.verifyToken, (req, res) => {
  pool.connect((err: any, connection: any) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const sql = 'SELECT * FROM Cours';

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
