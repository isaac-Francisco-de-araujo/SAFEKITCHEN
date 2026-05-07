import { EventosRepository } from "../repositories/eventosRepository";
import { Evento } from "../models/eventos";

export class EventosController {
  private repository = new EventosRepository();

  salvar(evento: Evento): Evento {
    return this.repository.salvar(evento);
  }

  listar(): Evento[] {
    return this.repository.listar();
  }

  buscarPorId(id: number): Evento | null {
    return this.repository.buscarPorId(id);
  }

  buscarPorTipo(tipo: string): Evento[] {
    return this.repository.buscarPorTipo(tipo);
  }

  deletar(id: number): void {
    this.repository.limpar(id);
  }

  limpar(): void {
    this.repository.limpar();
  }
}
