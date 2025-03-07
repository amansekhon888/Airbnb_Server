import express from "express";
import cors from "cors";
import routes from "./src/routes/index.js";
import { errorMiddleware } from "./src/middleware/errorMiddleware.js";

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use("/api", routes);

// Middleware for Errors
app.use(errorMiddleware);

export default app;
