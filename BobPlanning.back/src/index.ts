import { generateEdtMacro } from './generateExcel';
import express, { Request, Response } from 'express';
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = 3000;

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
 *   get:
 *     summary: Generate an Excel file based on start and end dates
 *     description: Returns an Excel file for the provided start and end dates.
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: The start date for the data (YYYY-MM-DD format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: The end date for the data (YYYY-MM-DD format)
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
 *                   example: /path/to/generated/file.xlsx
 *       400:
 *         description: Missing or invalid startDate or endDate
 *       500:
 *         description: Internal server error
 */
app.get('/generateEdtMacro', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).send('Missing startDate or endDate');
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const workbook = await generateEdtMacro(start, end);

    res.status(200).json({
      message: 'Excel file generated and saved on the server',
      filePath: '../files/file.xlsx',
    });

  } catch (error) {
    console.log(error);
    res.status(500).send('Internal server error');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
});
