import { generateEdtMacro } from './generateEdtMacro';
import { readMaquette } from './readMaquette';
import { MaquetteData } from './types/MaquetteData';
import { generateEdtSquelette } from './generateEdtMicro';
import express, { Request, Response } from 'express';
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const multer = require('multer');
const swaggerJsdoc = require('swagger-jsdoc');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(cors());

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

    const workbook = await generateEdtMacro(start, end, Promos);

    res.status(200).json({
      message: 'Excel file generated and saved on the server',
      filePath: '../files/file.xlsx',
    });

  } catch (error) {
    console.log(error);
    res.status(500).send('Internal server error' + error);
  }
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
 *             example: Erreur lors de la lecture du fichier Excel
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
 *             type: array
 *             description: List of classes with their respective courses
 *             items:
 *               type: object
 *               properties:
 *                 nomClasse:
 *                   type: string
 *                   description: The name of the class
 *                   example: "Classe 1"
 *                 semaine:
 *                   type: array
 *                   description: List of days of the week with their respective courses
 *                   items:
 *                     type: object
 *                     properties:
 *                       jour:
 *                         type: string
 *                         description: The day of the week
 *                         example: "Lundi"
 *                       cours:
 *                         type: array
 *                         description: List of courses for the day
 *                         items:
 *                           type: object
 *                           properties:
 *                             matiere:
 *                               type: string
 *                               description: The subject of the course
 *                               example: "Mathématiques"
 *                             heureDebut:
 *                               type: string
 *                               description: The start time of the course
 *                               example: "9h"
 *                             heureFin:
 *                               type: string
 *                               description: The end time of the course
 *                               example: "10h"
 *                             professeur:
 *                               type: string
 *                               description: The teacher of the course
 *                               example: "M. Dupont"
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
    const classes = req.body;

    // Vérifiez que les classes sont présentes
    if (!classes || !Array.isArray(classes)) {
      res.status(400).send('Missing or invalid data: Ensure classes are provided.');
      return;
    }

    // Assurez-vous que chaque classe a les jours et les cours correspondants
    const validClasses = classes.every((classe: any) => 
      classe.nomClasse && Array.isArray(classe.semaine) &&
      classe.semaine.every((jour: any) => jour.jour && Array.isArray(jour.cours))
    );

    if (!validClasses) {
      res.status(400).send('Invalid data: Ensure each class has a valid nomClasse, semaine, and courses for each day.');
      return;
    }

    // Appel de la fonction pour générer le fichier Excel (mise à jour pour s'adapter à la nouvelle structure)
    const filePath = await generateEdtSquelette({ classes });

    res.status(200).json({
      message: 'Excel file generated and saved on the server',
      filePath,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send('Internal server error: ' + error);
  }
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
});
