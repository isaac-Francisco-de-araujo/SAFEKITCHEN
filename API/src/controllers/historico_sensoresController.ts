import { app } from "../server";
import { HistoricoSensoresRepository } from "../repositories/historico_sensoresRepository";

export function HistoricoSensoresController() {
  const repository = new HistoricoSensoresRepository();

  // LISTAR TODOS
  app.get("/historico-sensores", (req, res) => {
    try {
      return res.json(repository.listar());
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : "Erro interno";

      return res.status(500).json({
        erro: mensagem,
      });
    }
  });

  // BUSCAR POR ID
  app.get("/historico-sensores/:id", (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          erro: "ID inválido",
        });
      }

      const historico = repository.buscarPorId(id);

      if (!historico) {
        return res.status(404).json({
          erro: "Registro não encontrado",
        });
      }

      return res.json(historico);
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : "Erro interno";

      return res.status(500).json({
        erro: mensagem,
      });
    }
  });

  // SALVAR REGISTRO
  app.post("/historico-sensores", (req, res) => {
    try {
      const {
        calor,
        fumaca,
        glp,
        movimento
      } = req.body;

      if (calor === undefined) {
        throw new Error("Valor de calor é obrigatório");
      }

      if (fumaca === undefined) {
        throw new Error("Valor de fumaça é obrigatório");
      }

      if (glp === undefined) {
        throw new Error("Valor de GLP é obrigatório");
      }

      if (movimento === undefined) {
        throw new Error("Valor de movimento é obrigatório");
      }

      const historico = repository.salvar({
        calor,
        fumaca,
        glp,
        movimento,
      });

      return res.status(201).json(historico);
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : "Erro interno";

      return res.status(400).json({
        erro: mensagem,
      });
    }
  });

  // LIMPAR HISTÓRICO
  app.delete("/historico-sensores", (req, res) => {
    try {
      repository.limpar();

      return res.json({
        mensagem: "Histórico removido com sucesso",
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