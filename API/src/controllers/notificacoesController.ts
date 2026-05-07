import { NotificacoesRepository } from "../repositories/notificacoesRepository";
import { Notificacao } from "../models/notificacoes";

export class NotificacoesController {
  private repository = new NotificacoesRepository();

  salvar(notificacao: Notificacao): Notificacao {
    return this.repository.salvar(notificacao);
  }

  listar(): Notificacao[] {
    return this.repository.listar();
  }

  buscarPorId(id: number): Notificacao | null {
    return this.repository.buscarPorId(id);
  }

  marcarComoEnviada(id: number): void {
    this.repository.marcarComoEnviada(id);
  }

  deletar(id: number): void {
    this.repository.deletar(id);
  }

  limpar(): void {
    this.repository.limpar();
  }
}
