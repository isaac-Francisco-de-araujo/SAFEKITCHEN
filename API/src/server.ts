import express from "express";

import { StatusSistemaController } from "./controllers/status-sistemaController";
import { EventosController } from "./controllers/eventosController";
import { HistoricoSensoresController } from "./controllers/historico_sensoresController";
import { NotificacoesController } from "./controllers/notificacoesController";

// APP
export const app = express();

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

app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando em http://localhost:${PORT}`);
});