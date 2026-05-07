/**
 * api.ts — Camada de serviço que conecta o frontend React à API Node.js
 * Base URL: http://localhost:3000
 */

const BASE_URL = "http://localhost:3000";

// ─── Tipos espelhados da API ──────────────────────────────────────────────────

export interface StatusSistema {
  id?: number;
  calor: number;
  fumaca: number;
  glp: number;
  movimento: number;
  ventilacao: number;
  gas: number;
  bomba: number;
  tomadas: number;
  estado_geral: string;
  atualizado_em?: string;
}

export interface Evento {
  id?: number;
  tipo: string;   // ALERTA | INCENDIO | EMERGENCIA | INFO
  mensagem: string;
  sensor?: string;
  atuador?: string;
  data_hora?: string;
}

export interface HistoricoSensores {
  id?: number;
  calor: number;
  fumaca: number;
  glp: number;
  movimento: number;
  data_hora?: string;
}

export interface Notificacao {
  id?: number;
  tipo: string;
  destino: string;
  mensagem: string;
  enviado?: number;
  data_hora?: string;
}

// ─── Helper interno ────────────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ erro: res.statusText }));
    throw new Error((err as any).erro ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── STATUS ───────────────────────────────────────────────────────────────────

export const statusApi = {
  /** Busca o estado atual do sistema */
  buscar: () => request<StatusSistema>("/status"),

  /** Atualiza sensores + atuadores + estado_geral */
  atualizar: (data: Partial<StatusSistema>) =>
    request<{ message: string }>("/status", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /** Reseta para estado NORMAL */
  resetar: () =>
    request<{ message: string }>("/status/reset", { method: "POST" }),
};

// ─── EVENTOS ──────────────────────────────────────────────────────────────────

export const eventosApi = {
  listar: () => request<Evento[]>("/eventos"),

  buscarPorId: (id: number) => request<Evento>(`/eventos/${id}`),

  buscarPorTipo: (tipo: string) => request<Evento[]>(`/eventos/tipo/${tipo}`),

  criar: (evento: Omit<Evento, "id" | "data_hora">) =>
    request<Evento>("/eventos", { method: "POST", body: JSON.stringify(evento) }),

  deletar: (id: number) =>
    request<{ message: string }>(`/eventos/${id}`, { method: "DELETE" }),

  limpar: () =>
    request<{ message: string }>("/eventos", { method: "DELETE" }),
};

// ─── HISTÓRICO ────────────────────────────────────────────────────────────────

export const historicoApi = {
  listar: () => request<HistoricoSensores[]>("/historico"),

  buscarPorId: (id: number) => request<HistoricoSensores>(`/historico/${id}`),

  registrar: (dados: Omit<HistoricoSensores, "id" | "data_hora">) =>
    request<HistoricoSensores>("/historico", {
      method: "POST",
      body: JSON.stringify(dados),
    }),

  limpar: () =>
    request<{ message: string }>("/historico", { method: "DELETE" }),
};

// ─── NOTIFICAÇÕES ─────────────────────────────────────────────────────────────

export const notificacoesApi = {
  listar: () => request<Notificacao[]>("/notificacoes"),

  buscarPorId: (id: number) => request<Notificacao>(`/notificacoes/${id}`),

  criar: (n: Omit<Notificacao, "id" | "data_hora">) =>
    request<Notificacao>("/notificacoes", { method: "POST", body: JSON.stringify(n) }),

  marcarEnviada: (id: number) =>
    request<{ message: string }>(`/notificacoes/${id}/enviada`, { method: "PUT" }),

  deletar: (id: number) =>
    request<{ message: string }>(`/notificacoes/${id}`, { method: "DELETE" }),

  limpar: () =>
    request<{ message: string }>("/notificacoes", { method: "DELETE" }),
};

// ─── Mapeadores: API → frontend types ─────────────────────────────────────────
// Converte o StatusSistema da API para os tipos usados pelo safety-engine

export function apiStatusToSensorValues(s: StatusSistema) {
  return {
    calor:     s.calor,
    fumaca:    s.fumaca,
    glp:       s.glp,
    movimento: s.movimento,
  };
}

export function apiStatusToActuatorStates(s: StatusSistema) {
  return {
    ventilacao:  s.ventilacao === 1  ? "on"    : "off",
    valvula_gas: s.gas       === 1  ? "open"  : "closed",
    bomba:       s.bomba     === 1  ? "on"    : "off",
    tomadas:     s.tomadas   === 1  ? "on"    : "cut",
  } as const;
}

export function sensorValuesToApiStatus(
  calor: number,
  fumaca: number,
  glp: number,
  movimento: number,
  ventilacao: string,
  gas: string,
  bomba: string,
  tomadas: string,
  estado_geral: string,
): Partial<StatusSistema> {
  return {
    calor,
    fumaca,
    glp,
    movimento,
    ventilacao: ventilacao === "on"   ? 1 : 0,
    gas:        gas        === "open" ? 1 : 0,
    bomba:      bomba      === "on"   ? 1 : 0,
    tomadas:    tomadas    === "on"   ? 1 : 0,
    estado_geral,
  };
}

/**
 * Mapeia SystemStatus (frontend) → estado_geral (banco)
 */
export function systemStatusToEstadoGeral(status: string): string {
  const map: Record<string, string> = {
    normal:    "NORMAL",
    alert:     "ALERTA",
    fire:      "INCENDIO",
    explosion: "EMERGENCIA",
    emergency: "EMERGENCIA",
  };
  return map[status] ?? "NORMAL";
}

/**
 * Mapeia estado_geral (banco) → SystemStatus (frontend)
 */
export function estadoGeralToSystemStatus(estado: string): string {
  const map: Record<string, string> = {
    NORMAL:    "normal",
    ALERTA:    "alert",
    INCENDIO:  "fire",
    EMERGENCIA:"emergency",
  };
  return map[estado] ?? "normal";
}