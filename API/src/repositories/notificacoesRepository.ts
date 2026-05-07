import db from "../Database/database";
import { Notificacao } from "../models/notificacoes";

export class NotificacoesRepository {

  // =========================
  // SALVAR NOTIFICAÇÃO
  // =========================
  salvar(notificacao: Notificacao): Notificacao {
    const resultado = db
      .prepare(`
        INSERT INTO notificacoes (tipo, destino, mensagem, enviado)
        VALUES (?, ?, ?, ?)
      `)
      .run(
        notificacao.tipo,
        notificacao.destino,
        notificacao.mensagem,
        notificacao.enviado ?? 0
      );

    return {
      id: Number(resultado.lastInsertRowid),
      tipo: notificacao.tipo,
      destino: notificacao.destino,
      mensagem: notificacao.mensagem,
      enviado: notificacao.enviado ?? 0,
      data_hora: new Date().toISOString()
    };
  }

  // =========================
  // LISTAR TODAS
  // =========================
  listar(): Notificacao[] {
    return db
      .prepare("SELECT * FROM notificacoes ORDER BY data_hora DESC")
      .all() as Notificacao[];
  }

  // =========================
  // BUSCAR POR ID
  // =========================
  buscarPorId(id: number): Notificacao | null {
    return (db
      .prepare("SELECT * FROM notificacoes WHERE id = ?")
      .get(id) as Notificacao) ?? null;
  }

  // =========================
  // MARCAR COMO ENVIADA
  // =========================
  marcarComoEnviada(id: number): void {
    db.prepare(`
      UPDATE notificacoes
      SET enviado = 1
      WHERE id = ?
    `).run(id);
  }

  // =========================
  // DELETAR
  // =========================
  deletar(id: number): void {
    db.prepare("DELETE FROM notificacoes WHERE id = ?").run(id);
  }

  // =========================
  // LIMPAR TABELA
  // =========================
  limpar(): void {
    db.prepare("DELETE FROM notificacoes").run();
  }
}