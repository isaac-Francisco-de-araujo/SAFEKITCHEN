import { useCallback, useEffect, useRef, useState } from "react";
import {
  statusApi,
  eventosApi,
  historicoApi,
  notificacoesApi,
  apiStatusToSensorValues,
  apiStatusToActuatorStates,
  sensorValuesToApiStatus,
  systemStatusToEstadoGeral,
  estadoGeralToSystemStatus,
  type StatusSistema,
  type Evento,
} from "./api";
import {
  evaluateSensorState,
  deriveSystemStatus,
  deriveActuators,
  buildAlerts,
  initialSensors,
  initialActuators,
} from "@/lib/safety-engine";
import type { Sensor, Actuator, SystemStatus, AlertMessage, ActuatorId } from "@/types/safety";

const POLL_MS = 2000; // busca a API a cada 2 segundos

export interface UseApiReturn {
  /** Sensores com estado atual */
  sensors: Sensor[];
  /** Atuadores com estado atual */
  actuators: Actuator[];
  /** Status geral do sistema */
  status: SystemStatus;
  /** Alertas/histórico de eventos */
  alerts: AlertMessage[];
  /** Sobrescritas manuais de atuadores */
  manualOverrides: Partial<Record<ActuatorId, boolean>>;
  /** true enquanto não recebeu a primeira resposta */
  loading: boolean;
  /** Mensagem de erro de conexão, ou null */
  error: string | null;
  /** Alterna um atuador manualmente e persiste na API */
  toggleActuator: (id: ActuatorId) => Promise<void>;
  /** Aciona emergência geral */
  triggerEmergency: () => Promise<void>;
  /** Reseta o sistema para NORMAL */
  resetSystem: () => Promise<void>;
  /** Limpa alertas e histórico */
  clearAlerts: () => Promise<void>;
  /** Registra evento de simulação no banco */
  simulateEvent: (tipo: "fire" | "gas" | "smoke" | "motion") => Promise<void>;
}

export function useApi(): UseApiReturn {
  const [sensors, setSensors] = useState<Sensor[]>(initialSensors);
  const [actuators, setActuators] = useState<Actuator[]>(initialActuators);
  const [status, setStatus] = useState<SystemStatus>("normal");
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const [manualOverrides, setManualOverrides] = useState<Partial<Record<ActuatorId, boolean>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastEstado = useRef<string>("");

  // ── Aplica dados da API aos estados React ─────────────────────────────────
  const applyApiData = useCallback(
    (apiStatus: StatusSistema, apiEventos: Evento[]) => {
      const vals = apiStatusToSensorValues(apiStatus);
      const actStates = apiStatusToActuatorStates(apiStatus);

      // Atualiza sensores
      const updatedSensors = initialSensors.map((s) => {
        const rawVal =
          s.id === "S_calor"     ? vals.calor     :
          s.id === "S_fumaca"    ? vals.fumaca     :
          s.id === "S_GLP"       ? vals.glp        :
          s.id === "S_movimento" ? vals.movimento  : s.value;
        return { ...s, value: rawVal, state: evaluateSensorState(s.id, rawVal) };
      });

      // Determina status derivado
      const derivedStatus = estadoGeralToSystemStatus(apiStatus.estado_geral) as SystemStatus;

      // Atualiza atuadores
      const updatedActuators = initialActuators.map((a) => ({
        ...a,
        state: (actStates as any)[a.id] ?? a.state,
      }));

      setSensors(updatedSensors);
      setActuators(updatedActuators);
      setStatus(derivedStatus);

      // Constrói alertas a partir dos eventos do banco + sensores
      const dbAlerts: AlertMessage[] = apiEventos.slice(0, 10).map((ev) => ({
        id: String(ev.id ?? Math.random()),
        level:
          ev.tipo === "INCENDIO"  ? "critical" :
          ev.tipo === "EMERGENCIA"? "critical"  :
          ev.tipo === "ALERTA"    ? "warning"   : "info",
        message: ev.mensagem,
        time: ev.data_hora
          ? new Date(ev.data_hora).toLocaleTimeString("pt-BR")
          : new Date().toLocaleTimeString("pt-BR"),
      }));

      const liveAlerts = buildAlerts(updatedSensors, derivedStatus);
      setAlerts(dbAlerts.length > 0 ? dbAlerts : liveAlerts);
      setError(null);
      setLoading(false);
    },
    [],
  );

  // ── Polling principal ────────────────────────────────────────────────────
  const poll = useCallback(async () => {
    try {
      const [apiStatus, apiEventos] = await Promise.all([
        statusApi.buscar(),
        eventosApi.listar(),
      ]);
      applyApiData(apiStatus, apiEventos);
    } catch (e: any) {
      setError(`Sem conexão com a API (${e.message}). Verifique se o servidor está rodando em http://localhost:3000`);
      setLoading(false);
    }
  }, [applyApiData]);

  useEffect(() => {
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, [poll]);

  // ── Persiste snapshot de sensores no histórico a cada 30s ───────────────
  useEffect(() => {
    const id = setInterval(async () => {
      if (error) return;
      const calor    = sensors.find((s) => s.id === "S_calor")!.value;
      const fumaca   = sensors.find((s) => s.id === "S_fumaca")!.value;
      const glp      = sensors.find((s) => s.id === "S_GLP")!.value;
      const movimento = sensors.find((s) => s.id === "S_movimento")!.value;
      try {
        await historicoApi.registrar({ calor, fumaca, glp, movimento });
      } catch { /* silencioso */ }
    }, 30_000);
    return () => clearInterval(id);
  }, [sensors, error]);

  // ── Ações ────────────────────────────────────────────────────────────────

  const toggleActuator = useCallback(
    async (id: ActuatorId) => {
      const current = actuators.find((a) => a.id === id)!;
      const isOn = current.state === "on" || current.state === "open";
      const newOverrides = { ...manualOverrides, [id]: !isOn };
      setManualOverrides(newOverrides);

      // Monta patch para a API
      const patch: Partial<StatusSistema> = {};
      if (id === "ventilacao")  patch.ventilacao = !isOn ? 1 : 0;
      if (id === "valvula_gas") patch.gas        = !isOn ? 1 : 0;
      if (id === "bomba")       patch.bomba      = !isOn ? 1 : 0;
      if (id === "tomadas")     patch.tomadas    = !isOn ? 1 : 0;

      try {
        await statusApi.atualizar(patch);
        // Registra evento
        const label: Record<ActuatorId, string> = {
          ventilacao: "Ventilação", valvula_gas: "Válvula GLP",
          bomba: "Bomba", tomadas: "Tomadas",
        };
        await eventosApi.criar({
          tipo: "INFO",
          mensagem: `${label[id]} ${!isOn ? "ativada" : "desativada"} manualmente`,
          atuador: id,
        });
      } catch { /* rollback silencioso — próximo poll corrige */ }
    },
    [actuators, manualOverrides],
  );

  const triggerEmergency = useCallback(async () => {
    try {
      await statusApi.atualizar({
        ventilacao: 1, gas: 0, bomba: 1, tomadas: 0, estado_geral: "EMERGENCIA",
      });
      await eventosApi.criar({
        tipo: "EMERGENCIA",
        mensagem: "Emergência geral ativada pelo operador",
        sensor: "manual",
        atuador: "todos",
      });
      await poll();
    } catch (e: any) {
      setError(e.message);
    }
  }, [poll]);

  const resetSystem = useCallback(async () => {
    try {
      await statusApi.resetar();
      setManualOverrides({});
      await poll();
    } catch (e: any) {
      setError(e.message);
    }
  }, [poll]);

  const clearAlerts = useCallback(async () => {
    try {
      await eventosApi.limpar();
      setAlerts([]);
    } catch { /* silencioso */ }
  }, []);

  const simulateEvent = useCallback(
    async (tipo: "fire" | "gas" | "smoke" | "motion") => {
      const patches: Record<string, Partial<StatusSistema> & { tipo: string; mensagem: string; sensor: string; atuador?: string }> = {
        fire: {
          calor: 85, fumaca: 50, gas: 0, bomba: 1, tomadas: 0,
          estado_geral: "INCENDIO",
          tipo: "INCENDIO", mensagem: "Incêndio simulado: fumaça + temperatura crítica",
          sensor: "S_calor,S_fumaca", atuador: "bomba,gas,tomadas",
        },
        gas: {
          glp: 1200, gas: 0, ventilacao: 1,
          estado_geral: "EMERGENCIA",
          tipo: "EMERGENCIA", mensagem: "Vazamento de GLP simulado — válvula fechada",
          sensor: "S_GLP", atuador: "gas,ventilacao",
        },
        smoke: {
          fumaca: 50, ventilacao: 1,
          estado_geral: "ALERTA",
          tipo: "ALERTA", mensagem: "Fumaça acima do limite detectada",
          sensor: "S_fumaca", atuador: "ventilacao",
        },
        motion: {
          movimento: 1,
          estado_geral: "NORMAL",
          tipo: "INFO", mensagem: "Presença detectada na cozinha",
          sensor: "S_movimento",
        },
      };

      const { tipo: evtTipo, mensagem, sensor, atuador, ...statusPatch } = patches[tipo];
      try {
        await statusApi.atualizar(statusPatch);
        await eventosApi.criar({ tipo: evtTipo, mensagem, sensor, atuador });
        await poll();
      } catch (e: any) {
        setError(e.message);
      }
    },
    [poll],
  );

  return {
    sensors, actuators, status, alerts,
    manualOverrides, loading, error,
    toggleActuator, triggerEmergency,
    resetSystem, clearAlerts, simulateEvent,
  };
}