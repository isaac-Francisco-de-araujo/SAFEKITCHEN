export interface Evento {
  id?: number;

  tipo: string;
  mensagem: string;

  sensor?: string;
  atuador?: string;

  data_hora?: string;
}