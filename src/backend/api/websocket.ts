import WebSocket from "ws";
import http from "http";
import { Event } from "../models/types";

let wsServer: WebSocket.Server;

export const initialiseWebsocket = (server: http.Server) => {
  wsServer = new WebSocket.Server({ server });
  
  wsServer.on("connection", (ws) => {
    console.log("Client connected to WebSocket");

    // Add ping-pong mechanism to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, 30000); // Send ping every 30 seconds

    ws.on("error", (error) => {
      console.log("WebSocket error:", error);
    });

    ws.on("close", () => {
      console.log("Client disconnected from WebSocket");
      clearInterval(pingInterval); // Clean up ping interval
    });

    // Handle incoming messages
    ws.on("message", (message) => {
      console.log("Received message:", message);
    });
  });

  console.log("WebSocket server initialized");
};

export const broadcastEvent = (event: Event) => {
  if (!wsServer) {
    console.error("WebSocket server not initialized");
    return;
  }

  wsServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(event));
    }
  });
};
