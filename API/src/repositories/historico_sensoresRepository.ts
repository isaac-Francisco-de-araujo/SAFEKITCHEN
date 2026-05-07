import db from "../Database/database";
import { HistoricoSensores } from "../models/historico_sensores";

export class HistoricoSensoresRepository {

  // SALVAR REGISTRO
  salvar(dados: HistoricoSensores): HistoricoSensores {
    const resultado = db
      .prepare(`
        INSERT INTO historico_sensores (calor, fumaca, glp, movimento)
        VALUES (?, ?, ?, ?)
      `)
      .run(
        dados.calor,
        dados.fumaca,
        dados.glp,
        dados.movimento
      );

    return {
      id: Number(resultado.lastInsertRowid),
      calor: dados.calor,
      fumaca: dados.fumaca,
      glp: dados.glp,
      movimento: dados.movimento,
      data_hora: new Date().toISOString()
    };
  }


  // LISTAR TODOS
  listar(): HistoricoSensores[] {
    return db
      .prepare("SELECT * FROM historico_sensores ORDER BY data_hora DESC")
      .all() as HistoricoSensores[];
  }

  
  // BUSCAR POR ID
  buscarPorId(id: number): HistoricoSensores | null {
    return (db
      .prepare("SELECT * FROM historico_sensores WHERE id = ?")
      .get(id) as HistoricoSensores) ?? null;
  }

  // LIMPAR HISTÓRICo
  limpar(): void {
    db.prepare("DELETE FROM historico_sensores").run();
  }
}