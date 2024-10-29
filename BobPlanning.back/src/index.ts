import { generateEdtMacro } from './macro/generateEdtMacro';
import { readMaquette } from './micro/readMaquette';
import { MaquetteData } from './types/MaquetteData';
import { generateEdtSquelette } from './micro/generateEdtSquelette';
import express, { Request, Response } from 'express';
import * as mysql from 'mysql2';
import getDBConfig from './database/getDBConfig';
import path from 'path';

const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const multer = require('multer');
const swaggerJsdoc = require('swagger-jsdoc');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const dbConfig = getDBConfig();

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(cors());

const connection = mysql.createConnection({
  host: dbConfig.DB_HOST,
  user: dbConfig.DB_USER,
  password: dbConfig.DB_PASSWORD,
  database: dbConfig.DB_NAME,
  port: dbConfig.DB_PORT
});

connection.connect((err: any) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
  } else {
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
 * /getPromosData:
 *   get:
 *     summary: Récupérer les données des promotions
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
app.get('/getPromosData', (req, res) => {
  interface Promo {
    Name: string;
    Nombre: number;
    Periode: {
      DateDebutP: string;
      DateFinP: string;
      nbSemaineP?: number; // Cette clé est optionnelle
    }[];
  }

  const promosData: { DateDeb: string; DateFin: string; Promos: Promo[] } = {
    DateDeb: "",
    DateFin: "",
    Promos: []
  };

  const sql = 'SELECT Name, Nombre, Periode FROM promosData';
  connection.query(sql, (error: any, results: any[]) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Conversion de `Periode` en tableau d'objets JSON
    const parsedResults = results.map((promo) => ({
      ...promo,
      Periode: promo.Periode ? JSON.parse(promo.Periode) : [] // Conversion de la chaîne JSON
    }));
    promosData.Promos = parsedResults;

    // Récupération des données du calendrier
    const calendarSql = 'SELECT dateDeb, dateFin FROM calendrier LIMIT 1';
    connection.query(calendarSql, (error: any, calendarResults: any) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      if (calendarResults.length > 0  && calendarResults[0].dateDeb && calendarResults[0].dateFin) {
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

app.post('/setPromosData', (req, res) => {
  const { DateDeb, DateFin, Promos } = req.body;
  console.log('req.body', req.body);

  const dateDeb = DateDeb || null;
  const dateFin = DateFin || null;
  const sql = 'UPDATE calendrier SET dateDeb = ?, dateFin = ?';
  connection.query(sql, [dateDeb, dateFin], (error: any) => {
    if (error) {
      console.log('1. error', error);
      return res.status(500).json({ error: error.message });
    }

    // Tableau de promesses pour chaque requête de mise à jour de promo
    const updatePromises = Promos.map((promo: { Nombre: any; Periode: any; Name: any; }) => {
      const updatePromosSql = 'UPDATE promosData SET Nombre = ?, Periode = ? WHERE Name = ?';
      return new Promise<void>((resolve, reject) => {
        connection.query(updatePromosSql, [promo.Nombre, JSON.stringify(promo.Periode), promo.Name], (error: any) => {
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
 * /generateEdtMacro:
 *   post:
 *     summary: Generate an Excel file based on provided data
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
app.post('/generateEdtMacro', async (req: Request, res: Response) => {
  try {
    const { DateDeb, DateFin, Promos } = req.body;

    if (!DateDeb || !DateFin || !Promos) {
      res.status(400).send('Missing startDate, endDate or Promos');
      return;
    }

    const start = new Date(DateDeb as string);
    const end = new Date(DateFin as string);

    const workbook = await generateEdtMacro({DateDeb: start, DateFin: end, Promos: Promos});



    res.status(200).json({
      message: 'Excel file generated and saved on the server',
       fileUrl: `http://localhost:${PORT}/download/EdtMacro`,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send('Internal server error' + error);
  }
});
// Route pour télécharger le fichier Excel
app.get('/download/EdtMacro', (req, res) => {
  const filePath = path.join(__dirname, '..', 'files', 'EdtMacro.xlsx');
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
 *       - Excel
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
app.post('/readMaquette', upload.single('file'), async (req: Request, res: Response): Promise<any> => {
  if (!req.file) {
    return res.status(400).send('Aucun fichier n\'a été téléchargé');
}

try {
    let data : MaquetteData;
    data = await readMaquette(req.file.buffer);
    res.json(data);
} catch (error) {
    res.status(500).json({ message: 'Erreur lors de la lecture du fichier Excel', error });
}
});

/**
 * @swagger
 * /generateEdtSquelette:
 *   post:
 *     summary: Generate an Excel timetable skeleton based on provided data
 *     description: Returns an Excel file representing the structure of a timetable, using the provided classes and their respective courses.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               EdtMicro:
 *                 type: array
 *                 description: Array of timetable micros, each with start date and class details
 *                 items:
 *                   type: object
 *                   properties:
 *                     DateDebut:
 *                       type: string
 *                       format: date
 *                       description: Start date of the timetable
 *                       example: "2023-10-01"
 *                     Promo:
 *                       type: array
 *                       description: Array of classes with schedules
 *                       items:
 *                         type: object
 *                         properties:
 *                           Name:
 *                             type: string
 *                             description: Name of the class
 *                             example: "Classe 1"
 *                           Semaine:
 *                             type: array
 *                             description: Weekly schedule with courses
 *                             items:
 *                               type: object
 *                               properties:
 *                                 Jour:
 *                                   type: string
 *                                   description: Day of the week
 *                                   example: "Lundi"
 *                                 EnCours:
 *                                   type: boolean
 *                                   description: Indicates if courses are scheduled on this day
 *                                 Message:
 *                                   type: string
 *                                   description: Additional message or note for the day
 *                                 Cours:
 *                                   type: array
 *                                   description: List of courses scheduled for the day
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       Matiere:
 *                                         type: string
 *                                         description: Subject of the course
 *                                         example: "Mathématiques"
 *                                       HeureDebut:
 *                                         type: string
 *                                         description: Start time of the course
 *                                         example: "9h"
 *                                       HeureFin:
 *                                         type: string
 *                                         description: End time of the course
 *                                         example: "10h"
 *                                       Professeur:
 *                                         type: string
 *                                         description: Teacher of the course
 *                                         example: "M. Dupont"
 *                                       Salle:
 *                                         type: string
 *                                         description: Room where the course is held
 *                                         example: "Salle 101"
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


app.post('/generateEdtSquelette', async (req: Request, res: Response) => {
  try {
    const edtMicro = req.body; // Changement effectué ici

    // Check if edtMicro is present and valid
    if (!edtMicro || !Array.isArray(edtMicro.EdtMicro)) { // Changement effectué ici
      res.status(400).send('Missing or invalid data: Ensure EdtMicro is provided.'); // Changement effectué ici
      return;
    }

    // Validate structure of edtMicro data
    const isValid = edtMicro.EdtMicro.every((macro: any) => // Changement effectué ici
      macro.DateDebut &&
      Array.isArray(macro.Promo) &&
      macro.Promo.every((promo: any) => 
        promo.Name && 
        Array.isArray(promo.Semaine) &&
        promo.Semaine.every((semaine: any) => 
          semaine.Jour && typeof semaine.EnCours === 'boolean' && Array.isArray(semaine.Cours)
        )
      )
    );

    if (!isValid) {
      res.status(400).send('Invalid data: Ensure EdtMicro structure follows the required format.'); // Changement effectué ici
      return;
    }

    // Call function to generate the Excel file
    const filePath = await generateEdtSquelette(edtMicro); // Changement effectué ici

    res.status(200).json({
      message: 'Excel file generated and saved on the server',
      filePath,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error: ' + error);
  }
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
});
