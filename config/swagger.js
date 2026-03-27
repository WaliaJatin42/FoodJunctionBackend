const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Swagger config
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Food Junction Cafe API",
      version: "1.0.0",
      description:
        "API Documentation for the Omnichannel Cafe Backend (Auth, Orders, Delivery Queue).",
      contact: {
        name: "Developer",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local Developer Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Automatically pull swagger annotations from controllers
  apis: ["./routes/*.js", "./controllers/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

module.exports = setupSwagger;
