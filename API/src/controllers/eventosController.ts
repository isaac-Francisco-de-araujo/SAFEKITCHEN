import { app } from "../server";
import { EventosRepository } from "../repositories/eventosRepository";

export function EventosController() {
  const repository = new EventosRepository();

  // LISTAR TODOS OU BUSCAR POR TIPO
  app.get("/eventos", (req, res) => {
    try {
      const { tipo } = req.query;

      if (tipo) {
        return res.json(repository.buscarPorTipo(tipo as string));
      }

      return res.json(repository.listar());
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : "Erro interno";

      return res.status(500).json({ erro: mensagem });
    }
  });

  // BUSCAR POR ID
  app.get("/eventos/:id", (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          erro: "ID inválido",
        });
      }

      const evento = repository.buscarPorId(id);

      if (!evento) {
        return res.status(404).json({
          erro: "Evento não encontrado",
        });
      }

      return res.json(evento);
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : "Erro interno";

      return res.status(500).json({ erro: mensagem });
    }
  });

  // SALVAR EVENTO
  app.post("/eventos", (req, res) => {
    try {
      const { tipo, mensagem, sensor, atuador } = req.body;

      if (!tipo || tipo.trim().length === 0) {
        throw new Error("Tipo é obrigatório");
      }

      if (!mensagem || mensagem.trim().length === 0) {
        throw new Error("Mensagem é obrigatória");
      }

      const evento = repository.salvar({
        tipo,
        mensagem,
        sensor,
        atuador,
      });

      return res.status(201).json(evento);
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : "Erro interno";

      return res.status(400).json({
        erro: mensagem,
      });
    }
  });

  // DELETAR EVENTO POR ID
  app.delete("/eventos/:id", (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          erro: "ID inválido",
        });
      }

      const evento = repository.buscarPorId(id);

      if (!evento) {
        return res.status(404).json({
          erro: "Evento não encontrado",
        });
      }

      repository.limpar(id);

      return res.json({
        mensagem: "Evento deletado com sucesso",
      });
    } catch (err) {
      const mensagem =
        err instanceof Error ? err.message : "Erro interno";

      return res.status(500).json({
        erro: mensagem,
      });
    }
  });

  // LIMPAR TODOS EVENTOS
  app.delete("/eventos", (req, res) => {
    try {
      repository.limpar();

      return res.json({
        mensagem: "Todos os eventos foram removidos",
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