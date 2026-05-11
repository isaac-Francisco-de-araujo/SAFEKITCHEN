import { app } from "../server";
import { StatusSistemaRepository } from "../repositories/status-sistemaRepository";

export function StatusSistemaController() {
  const repository = new StatusSistemaRepository();

  // GARANTIR EXISTÊNCIA DO STATUS
  repository.criarSeNaoExistir();

  // BUSCAR STATUS DO SISTEMA
  app.get("/status-sistema", (req, res) => {
    try {
      const status = repository.buscar();

      if (!status) {
        return res.status(404).json({
          erro: "Status do sistema não encontrado",
        });
      }

      return res.json(status);
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : "Erro interno";

      return res.status(500).json({
        erro: mensagem,
      });
    }
  });

  // ATUALIZAR STATUS
  app.put("/status-sistema", (req, res) => {
    try {
      const {
        calor,
        fumaca,
        glp,
        movimento,
        ventilacao,
        gas,
        bomba,
        tomadas,
        estado_geral
      } = req.body;

      if (!estado_geral) {
        throw new Error("Estado geral é obrigatório");
      }

      repository.atualizar({
        calor,
        fumaca,
        glp,
        movimento,
        ventilacao,
        gas,
        bomba,
        tomadas,
        estado_geral
      });

      return res.json({
        mensagem: "Status atualizado com sucesso",
      });
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : "Erro interno";

      return res.status(400).json({
        erro: mensagem,
      });
    }
  });

  // RESETAR SISTEMA
  app.post("/status-sistema/resetar", (req, res) => {
    try {
      repository.resetar();

      return res.json({
        mensagem: "Sistema resetado com sucesso",
      });
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : "Erro interno";

      return res.status(500).json({
        erro: mensagem,
      });
    }
  });
}