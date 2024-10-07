const express = require('express');
const ExcelJS = require('exceljs');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = 3000;

// Swagger definition setup
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
  apis: ['./index.js'], // Path to the API docs
};

// Swagger docs setup
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Route to serve Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
});
