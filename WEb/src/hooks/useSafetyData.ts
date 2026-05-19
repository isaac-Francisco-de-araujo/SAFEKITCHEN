import { useEffect, useMemo, useRef, useState } from "react";

import {
  initialSensors,
  initialActuators,
  evaluateSensorState,
  deriveSystemStatus,
  deriveActuators,
  buildAlerts,
} from "@/lib/safety-engine";

import type {
  Sensor,
  SystemStatus,
  AlertMessage,
  ActuatorId,
} from "@/types/safety";

import {
  getStatusSistema,
  listarEventos,
} from "@/services/api";

export interface ChartPoint {
  t: string;
  calor: number;
  fumaca: number;
  glp: number;
}

export interface SafetyData {
  sensors: Sensor[];
  actuators: ReturnType<typeof deriveActuators>;
  status: SystemStatus;
  alerts: AlertMessage[];
  series: ChartPoint[];
  manualOverrides: Partial<Record<ActuatorId, boolean>>;
  now: Date;
}

export function useSafetyData() {
  const [sensors, setSensors] =
    useState<Sensor[]>(initialSensors);

  const [forceStatus, setForceStatus] =
    useState<SystemStatus | null>(null);

  const [series, setSeries] =
    useState<ChartPoint[]>([]);

  const [history, setHistory] =
    useState<AlertMessage[]>([]);

  const [manualOverrides, setManualOverrides] =
    useState<Partial<Record<ActuatorId, boolean>>>({});

  const [now, setNow] =
    useState(() => new Date());

  const lastStatus =
    useRef<SystemStatus>("normal");

  // ===========================================================================
  // BACKEND
  // ===========================================================================

  useEffect(() => {
    let mounted = true;

    async function carregarDados() {
      try {
        const [
          statusData,
          eventosData,
        ] = await Promise.all([
          getStatusSistema(),
          listarEventos(),
        ]);

        if (!mounted) return;

        setNow(new Date());

        // Atualizar sensores
        setSensors((prev) =>
          prev.map((sensor) => {
            const values: Record<string, number> = {
              S_calor: Number(statusData.calor ?? 0),
              S_fumaca: Number(statusData.fumaca ?? 0),
              S_GLP: Number(statusData.glp ?? 0),
              S_movimento: Number(statusData.movimento ?? 0),
            };

            const value =
              values[sensor.id] ?? 0;

            return {
              ...sensor,
              value,
              state: evaluateSensorState(
                sensor.id,
                value
              ),
            };
          })
        );

        // Eventos -> alertas
        const eventosConvertidos: AlertMessage[] =
          eventosData.map((evento: any) => ({
            id: String(evento.id),

            level:
              evento.tipo === "INFO"
                ? "info"
                : evento.tipo === "ALERTA"
                ? "warning"
                : "critical",

            message: evento.mensagem,

            time: new Date(
              evento.data_hora
            ).toLocaleTimeString("pt-BR"),
          }));

        setHistory(eventosConvertidos);

      } catch (error) {
        console.error(
          "Erro ao carregar dados:",
          error
        );
      }
    }

    carregarDados();

    const interval = setInterval(
      carregarDados,
      3000
    );

    return () => {
      mounted = false;
      clearInterval(interval);
    };

  }, []);

  // ===========================================================================
  // STATUS
  // ===========================================================================

  const status: SystemStatus = useMemo(
    () =>
      forceStatus ??
      deriveSystemStatus(sensors),

    [sensors, forceStatus]
  );

  // ===========================================================================
  // ATUADORES
  // ===========================================================================

  const actuators = useMemo(
    () =>
      deriveActuators(
        initialActuators,
        status,
        sensors,
        manualOverrides
      ),

    [
      status,
      sensors,
      manualOverrides,
    ]
  );

  // ===========================================================================
  // ALERTAS
  // ===========================================================================

  const liveAlerts = useMemo(
    () => buildAlerts(sensors, status),
    [sensors, status]
  );

  const alerts =
    history.length > 0
      ? history
      : liveAlerts;

  // ===========================================================================
  // GRÁFICOS
  // ===========================================================================

  useEffect(() => {

    const calor =
      sensors.find(
        (s) => s.id === "S_calor"
      )?.value ?? 0;

    const fumaca =
      sensors.find(
        (s) => s.id === "S_fumaca"
      )?.value ?? 0;

    const glp =
      sensors.find(
        (s) => s.id === "S_GLP"
      )?.value ?? 0;

    const t =
      now.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

    setSeries((prev) => [
      ...prev,
      {
        t,
        calor,
        fumaca,
        glp,
      },
    ].slice(-20));

  }, [sensors, now]);

  // ===========================================================================
  // HISTÓRICO DE STATUS
  // ===========================================================================

  useEffect(() => {

    if (status === lastStatus.current)
      return;

    const t =
      new Date().toLocaleTimeString(
        "pt-BR"
      );

    const map: Record<
      SystemStatus,
      AlertMessage
    > = {

      normal: {
        id: `n-${Date.now()}`,
        level: "info",
        message:
          "Sistema voltou ao normal",
        time: t,
      },

      alert: {
        id: `a-${Date.now()}`,
        level: "warning",
        message:
          "Alerta detectado",
        time: t,
      },

      fire: {
        id: `f-${Date.now()}`,
        level: "critical",
        message:
          "Incêndio detectado",
        time: t,
      },

      explosion: {
        id: `e-${Date.now()}`,
        level: "critical",
        message:
          "Vazamento de GLP detectado",
        time: t,
      },

      emergency: {
        id: `em-${Date.now()}`,
        level: "critical",
        message:
          "Emergência manual ativada",
        time: t,
      },
    };

    setHistory((prev) => [
      map[status],
      ...prev,
    ].slice(0, 12));

    lastStatus.current = status;

  }, [status]);

  // ===========================================================================
  // AÇÕES
  // ===========================================================================

  function toggleActuator(
    id: ActuatorId
  ) {

    const current =
      actuators.find(
        (a) => a.id === id
      );

    if (!current) return;

    const isOn =
      current.state === "on" ||
      current.state === "open";

    setManualOverrides((prev) => ({
      ...prev,
      [id]: !isOn,
    }));

    // TODO:
    // await api.toggleActuator(id, !isOn)
  }

  function triggerEmergency() {

    setForceStatus((prev) =>
      prev === "emergency"
        ? null
        : "emergency"
    );
  }

  function testSystem() {

    setHistory((prev) => [
      {
        id: `t-${Date.now()}`,

        level: "info" as const,

        message:
          "Teste do sistema executado",

        time: new Date()
          .toLocaleTimeString("pt-BR"),
      },

      ...prev,
    ].slice(0, 12));
  }

  function clearAlerts() {

    setHistory([]);

    setManualOverrides({});

    setSensors(
      initialSensors.map((s) => ({
        ...s,
      }))
    );
  }

  return {
    sensors,
    actuators,
    status,
    alerts,
    series,
    manualOverrides,
    now,

    toggleActuator,
    setForceStatus,
    triggerEmergency,
    testSystem,
    clearAlerts,
  };
}