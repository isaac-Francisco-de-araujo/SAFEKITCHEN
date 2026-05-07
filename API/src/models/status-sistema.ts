export interface StatusSistema {
  id?: number;
  calor: number;
  fumaca: number;
  glp: number;
  movimento: number;
  //atuadores
  ventilacao: number;
  gas: number;
  bomba: number;
  tomadas: number;
  estado_geral: string;
  atualizado_em?: string;
}