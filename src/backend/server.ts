import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "../backend/api/routes";
import { initialiseWebsocket } from "./api/websocket";
import { initializeDatabase } from "./config/database";
import { initializeCommandProcessor } from "./messaging/commandHandler";
import { initialiseEventProcessor } from "./messaging/eventHandler";
import { initializeProducer } from "./messaging/producer";

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use("/api", apiRoutes);

// Serve static files from frontend directory
app.use(express.static("src/frontend"));

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    initializeDatabase();
    initializeProducer();
    initializeCommandProcessor();
    initialiseEventProcessor();
    initialiseWebsocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
