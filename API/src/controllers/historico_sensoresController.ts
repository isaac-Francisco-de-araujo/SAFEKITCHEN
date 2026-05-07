import { HistoricoSensoresRepository } from "../repositories/historico_sensoresRepository";
import { HistoricoSensores } from "../models/historico_sensores";

export class HistoricoSensoresController {
  private repository = new HistoricoSensoresRepository();

  salvar(dados: HistoricoSensores): HistoricoSensores {
    return this.repository.salvar(dados);
  }

  listar(): HistoricoSensores[] {
    return this.repository.listar();
  }

  buscarPorId(id: number): HistoricoSensores | null {
    return this.repository.buscarPorId(id);
  }

  limpar(): void {
    this.repository.limpar();
  }
}