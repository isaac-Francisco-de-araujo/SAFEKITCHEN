import db from "../Database/database";
import { Evento } from "../models/eventos";

export class EventosRepository {
  // SALVAR EVENTO
  salvar(evento: Evento): Evento {
    const resultado = db
      .prepare(`
        INSERT INTO eventos (tipo, mensagem, sensor, atuador)
        VALUES (?, ?, ?, ?)
      `)
      .run(
        evento.tipo,
        evento.mensagem,
        evento.sensor ?? null,
        evento.atuador ?? null
      );

    return {
      id: Number(resultado.lastInsertRowid),
      tipo: evento.tipo,
      mensagem: evento.mensagem,
      sensor: evento.sensor,
      atuador: evento.atuador,
      data_hora: new Date().toISOString(),
    };
  }

  // LISTAR TODOS
  listar(): Evento[] {
    return db
      .prepare("SELECT * FROM eventos ORDER BY data_hora DESC")
      .all() as Evento[];
  }

  // BUSCAR POR ID
  buscarPorId(id: number): Evento | null {
    return (
      (db.prepare("SELECT * FROM eventos WHERE id = ?").get(id) as Evento) ?? null
    );
  }

  // BUSCAR POR TIPO
  buscarPorTipo(tipo: string): Evento[] {
    return db
      .prepare("SELECT * FROM eventos WHERE tipo = ? ORDER BY data_hora DESC")
      .all(tipo) as Evento[];
  }

  // LIMPAR (se id existir, remove só aquele)
  limpar(id?: number): void {
    if (typeof id === "number") {
      db.prepare("DELETE FROM eventos WHERE id = ?").run(id);
      return;
    }
    db.prepare("DELETE FROM eventos").run();
  }
}

