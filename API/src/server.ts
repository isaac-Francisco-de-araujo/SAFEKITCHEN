import * as http from "http";
import { StatusSistemaController } from "./controllers/status-sistemaController";
import { EventosController } from "./controllers/eventosController";
import { HistoricoSensoresController } from "./controllers/historico_sensoresController";
import { NotificacoesController } from "./controllers/notificacoesController";

// ─── Controllers ───────────────────────────────────────────────
const statusCtrl = new StatusSistemaController();
const eventosCtrl = new EventosController();
const historicoCtrl = new HistoricoSensoresController();
const notificacoesCtrl = new NotificacoesController();

// ─── Helpers ───────────────────────────────────────────────────
function json(res: http.ServerResponse, status: number, data: unknown) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}

function readBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => { raw += String(chunk); });
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch { reject(new Error("JSON inválido")); }
    });
  });
}

// ─── SERVER ───────────────────────────────────────────────────
const srv = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
  const method = req.method ?? "GET";
  const url = req.url ?? "/";

  // CORS preflight
  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  try {
    // ───── STATUS ─────
    if (method === "GET" && url === "/status") {
      return json(res, 200, statusCtrl.buscar());
    }
    if (method === "PUT" && url === "/status") {
      const body = await readBody(req);
      statusCtrl.atualizar(body);
      return json(res, 200, { message: "Status atualizado" });
    }
    if (method === "POST" && url === "/status/reset") {
      statusCtrl.resetar();
      return json(res, 200, { message: "Status resetado" });
    }

    // ───── EVENTOS ─────
    if (method === "GET" && url === "/eventos") {
      return json(res, 200, eventosCtrl.listar());
    }
    if (method === "POST" && url === "/eventos") {
      const body = await readBody(req);
      return json(res, 201, eventosCtrl.salvar(body));
    }
    if (method === "DELETE" && url === "/eventos") {
      eventosCtrl.limpar();
      return json(res, 200, { message: "Eventos apagados" });
    }
    if (method === "GET" && /^\/eventos\/tipo\/\w+$/.test(url)) {
      const tipo = url.split("/")[3];
      return json(res, 200, eventosCtrl.buscarPorTipo(tipo));
    }
    if (method === "GET" && /^\/eventos\/\d+$/.test(url)) {
      const id = Number(url.split("/")[2]);
      const evento = eventosCtrl.buscarPorId(id);
      if (!evento) return json(res, 404, { erro: "Evento não encontrado" });
      return json(res, 200, evento);
    }
    if (method === "DELETE" && /^\/eventos\/\d+$/.test(url)) {
      const id = Number(url.split("/")[2]);
      eventosCtrl.deletar(id);
      return json(res, 200, { message: `Evento ${id} deletado` });
    }

    // ───── HISTÓRICO ─────
    if (method === "GET" && url === "/historico") {
      return json(res, 200, historicoCtrl.listar());
    }
    if (method === "POST" && url === "/historico") {
      const body = await readBody(req);
      return json(res, 201, historicoCtrl.salvar(body));
    }
    if (method === "GET" && /^\/historico\/\d+$/.test(url)) {
      const id = Number(url.split("/")[2]);
      const reg = historicoCtrl.buscarPorId(id);
      if (!reg) return json(res, 404, { erro: "Registro não encontrado" });
      return json(res, 200, reg);
    }
    if (method === "DELETE" && url === "/historico") {
      historicoCtrl.limpar();
      return json(res, 200, { message: "Histórico apagado" });
    }

    // ───── NOTIFICAÇÕES ─────
    if (method === "GET" && url === "/notificacoes") {
      return json(res, 200, notificacoesCtrl.listar());
    }
    if (method === "POST" && url === "/notificacoes") {
      const body = await readBody(req);
      return json(res, 201, notificacoesCtrl.salvar(body));
    }
    if (method === "GET" && /^\/notificacoes\/\d+$/.test(url)) {
      const id = Number(url.split("/")[2]);
      const notif = notificacoesCtrl.buscarPorId(id);
      if (!notif) return json(res, 404, { erro: "Notificação não encontrada" });
      return json(res, 200, notif);
    }
    if (method === "PUT" && /^\/notificacoes\/\d+\/enviada$/.test(url)) {
      const id = Number(url.split("/")[2]);
      notificacoesCtrl.marcarComoEnviada(id);
      return json(res, 200, { message: `Notificação ${id} marcada como enviada` });
    }
    if (method === "DELETE" && /^\/notificacoes\/\d+$/.test(url)) {
      const id = Number(url.split("/")[2]);
      notificacoesCtrl.deletar(id);
      return json(res, 200, { message: `Notificação ${id} deletada` });
    }
    if (method === "DELETE" && url === "/notificacoes") {
      notificacoesCtrl.limpar();
      return json(res, 200, { message: "Notificações apagadas" });
    }

    // ───── 404 ─────
    return json(res, 404, { erro: `Rota não encontrada: ${method} ${url}` });
  } catch (err: any) {
    console.error("[ERRO]", err);
    return json(res, 500, { erro: err.message ?? "Erro interno" });
  }
});

// ─── START ─────────────────────────────────────────────────────
const PORT = 3000;
srv.listen(PORT, () => {
  console.log(`🔥 Servidor rodando em http://localhost:${PORT}`);
});