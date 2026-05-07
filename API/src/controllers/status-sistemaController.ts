import { StatusSistemaRepository } from "../repositories/status-sistemaRepository";
import { StatusSistema } from "../models/status-sistema";

export class StatusSistemaController {
  private repository = new StatusSistemaRepository();

  buscar(): StatusSistema | null {
    return this.repository.buscar();
  }

  criarSeNaoExistir(): void {
    this.repository.criarSeNaoExistir();
  }

  atualizar(status: StatusSistema): void {
    this.repository.atualizar(status);
  }

  resetar(): void {
    this.repository.resetar();
  }
}
