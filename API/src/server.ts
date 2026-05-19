import express from "express";
import http from "http";
import { Server } from "socket.io";
import "./serial/listener";

import { StatusSistemaController } from "./controllers/status-sistemaController";
import { EventosController } from "./controllers/eventosController";
import { HistoricoSensoresController } from "./controllers/historico_sensoresController";
import { NotificacoesController } from "./controllers/notificacoesController";

// APP
export const app = express();

// HTTP SERVER
const server = http.createServer(app);

// SOCKET.IO
export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

// SOCKET EVENTS
io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado:", socket.id);

  // TESTE
  socket.on("mensagem", (data) => {
    console.log("📩 Mensagem recebida:", data);

    // ENVIA PARA TODOS
    io.emit("mensagem", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado:", socket.id);
  });
});

// MIDDLEWARES
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// CONTROLLERS
StatusSistemaController();
EventosController();
HistoricoSensoresController();
NotificacoesController();

// ROTA TESTE
app.get("/", (req, res) => {
  res.json({
    mensagem: "SAFEKITCHEN API ONLINE",
  });
});

// START SERVER
const PORT = 3000;

server.listen(PORT, () => {
  console.log(`🔥 Servidor rodando em http://localhost:${PORT}`);
});