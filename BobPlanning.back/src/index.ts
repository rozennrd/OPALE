import { generateEdtMacro } from './generateEdtMacro';
import { readMaquette } from './readMaquette';
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
  apis: ['./src/index.ts'], 
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
 *                       heure:
 *                         type: array
 *                         items:
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
    const data = await readMaquette(req.file.buffer.toString('utf-8'));
    res.json(data);
} catch (error) {
    res.status(500).json({ message: 'Erreur lors de la lecture du fichier Excel', error });
}
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
});
