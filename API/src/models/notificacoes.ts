export interface Notificacao {
  id?: number;

  tipo: string;
  destino: string;
  mensagem: string;

  enviado?: number; // 0 ou 1

  data_hora?: string;
}