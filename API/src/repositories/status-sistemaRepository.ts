import db from "../Database/database";
import { StatusSistema } from "../models/status-sistema";

export class StatusSistemaRepository {

  // BUSCAR STATUS (ID FIXO = 1)
  buscar(): StatusSistema | null {
    return (db
      .prepare("SELECT * FROM status_sistema WHERE id = 1")
      .get() as StatusSistema) ?? null;
  }

  // CRIAR OU GARANTIR EXISTÊNCIA
  criarSeNaoExistir(): void {
    db.prepare(`
      INSERT INTO status_sistema (
        id, calor, fumaca, glp, movimento,
        ventilacao, gas, bomba, tomadas,
        estado_geral
      )
      SELECT 
        1, 0, 0, 0, 0,
        1, 1, 0, 1,
        'NORMAL'
      WHERE NOT EXISTS (
        SELECT 1 FROM status_sistema WHERE id = 1
      )
    `).run();
  }

  // ATUALIZAR STATUS
  atualizar(status: StatusSistema): void {
    db.prepare(`
      UPDATE status_sistema
      SET 
        calor = ?,
        fumaca = ?,
        glp = ?,
        movimento = ?,
        ventilacao = ?,
        gas = ?,
        bomba = ?,
        tomadas = ?,
        estado_geral = ?,
        atualizado_em = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(
      status.calor,
      status.fumaca,
      status.glp,
      status.movimento,
      status.ventilacao,
      status.gas,
      status.bomba,
      status.tomadas,
      status.estado_geral
    );
  }

  // RESETAR STATUS
  resetar(): void {
    db.prepare(`
      UPDATE status_sistema
      SET 
        calor = 0,
        fumaca = 0,
        glp = 0,
        movimento = 0,
        ventilacao = 1,
        gas = 1,
        bomba = 0,
        tomadas = 1,
        estado_geral = 'NORMAL',
        atualizado_em = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run();
  }
}