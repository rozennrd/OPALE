import { generateEdtMacro } from './generateEdtMacro';
import { generateEdtSquelette } from './generateEdtMicro';
import express, { Request, Response } from 'express';
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

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
 * /generateEdtSquelette:
 *   post:
 *     summary: Generate an Excel timetable skeleton based on provided data
 *     description: Returns an Excel file representing the structure of a timetable, using the provided column names.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               columnsData:
 *                 type: object
 *                 description: The timetable data containing column names
 *                 properties:
 *                   nomsColonnes:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: The names of the columns to be added under each day of the week
 *                     example: ["Mathématiques", "Sciences", "Histoire"]
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
 *                   example: Excel file generated and saved on the server
 *                 filePath:
 *                   type: string
 *                   example: ../files/EdtSquelette.xlsx
 *       400:
 *         description: Missing or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Missing columnsData
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Internal server error
 */
app.post('/generateEdtSquelette', async (req: Request, res: Response) => {
  try {
    const { columnsData } = req.body;

    // Vérifiez que columnsData et nomsColonnes sont présents
    if (!columnsData || !columnsData.nomsColonnes || !Array.isArray(columnsData.nomsColonnes)) {
      res.status(400).send('Missing or invalid data: Ensure columnsData and nomsColonnes are provided.');
      return;
    }

    const filePath = await generateEdtSquelette(columnsData);

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
