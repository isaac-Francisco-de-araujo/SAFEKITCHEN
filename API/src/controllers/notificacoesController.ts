import { app } from "../server";
import { NotificacoesRepository } from "../repositories/notificacoesRepository";

export function NotificacoesController() {
  const repository = new NotificacoesRepository();

  // LISTAR TODAS
  app.get("/notificacoes", (req, res) => {
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
  app.get("/notificacoes/:id", (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          erro: "ID inválido",
        });
      }

      const notificacao = repository.buscarPorId(id);

      if (!notificacao) {
        return res.status(404).json({
          erro: "Notificação não encontrada",
        });
      }

      return res.json(notificacao);
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : "Erro interno";

      return res.status(500).json({
        erro: mensagem,
      });
    }
  });

  // SALVAR NOTIFICAÇÃO
  app.post("/notificacoes", (req, res) => {
    try {
      const {
        tipo,
        destino,
        mensagem,
        enviado
      } = req.body;

      if (!tipo || tipo.trim().length === 0) {
        throw new Error("Tipo é obrigatório");
      }

      if (!destino || destino.trim().length === 0) {
        throw new Error("Destino é obrigatório");
      }

      if (!mensagem || mensagem.trim().length === 0) {
        throw new Error("Mensagem é obrigatória");
      }

      const notificacao = repository.salvar({
        tipo,
        destino,
        mensagem,
        enviado,
      });

      return res.status(201).json(notificacao);
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : "Erro interno";

      return res.status(400).json({
        erro: mensagem,
      });
    }
  });

  // MARCAR COMO ENVIADA
  app.patch("/notificacoes/:id/enviada", (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          erro: "ID inválido",
        });
      }

      const notificacao = repository.buscarPorId(id);

      if (!notificacao) {
        return res.status(404).json({
          erro: "Notificação não encontrada",
        });
      }

      repository.marcarComoEnviada(id);

      return res.json({
        mensagem: "Notificação marcada como enviada",
      });
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : "Erro interno";

      return res.status(500).json({
        erro: mensagem,
      });
    }
  });

  // DELETAR NOTIFICAÇÃO
  app.delete("/notificacoes/:id", (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          erro: "ID inválido",
        });
      }

      const notificacao = repository.buscarPorId(id);

      if (!notificacao) {
        return res.status(404).json({
          erro: "Notificação não encontrada",
        });
      }

      repository.deletar(id);

      return res.json({
        mensagem: "Notificação removida com sucesso",
      });
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : "Erro interno";

      return res.status(500).json({
        erro: mensagem,
      });
    }
  });

  // LIMPAR TABELA
  app.delete("/notificacoes", (req, res) => {
    try {
      repository.limpar();

      return res.json({
        mensagem: "Todas as notificações foram removidas",
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