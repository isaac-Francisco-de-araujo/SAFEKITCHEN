import { useMemo, useRef, useState, useEffect } from "react";
import { Sidebar } from "@/components/safety/Sidebar";
import { TopBar } from "@/components/safety/TopBar";
import { KpiCard } from "@/components/safety/KpiCard";
import { KitchenView } from "@/components/safety/KitchenView";
import { ActuatorGrid } from "@/components/safety/ActuatorGrid";
import { SystemStatusCard } from "@/components/safety/SystemStatusCard";
import { EventHistory } from "@/components/safety/EventHistory";
import { RealtimeCharts } from "@/components/safety/RealtimeCharts";
import { QuickControls } from "@/components/safety/QuickControls";
import { EmergencyButton } from "@/components/safety/EmergencyButton";
import { ManualControls } from "@/components/safety/ManualControls";
import { CriticalAlertModal, type CriticalAlert } from "@/components/safety/CriticalAlertModal";
import { useApi } from "@/hooks/useApi";
import type { ActuatorId } from "@/types/safety";

interface ChartPoint { t: string; calor: number; fumaca: number; glp: number }

const Index = () => {
  const {
    sensors, actuators, status, alerts,
    manualOverrides, loading, error,
    toggleActuator, triggerEmergency,
    resetSystem, clearAlerts, simulateEvent,
  } = useApi();

  const [now, setNow] = useState(() => new Date());
  const [series, setSeries] = useState<ChartPoint[]>([]);
  const [criticalAlert, setCriticalAlert] = useState<CriticalAlert | null>(null);
  const lastStatus = useRef(status);
  const dismissedAlerts = useRef<Set<string>>(new Set());

  // Relógio local
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Série temporal para gráficos
  useEffect(() => {
    const t = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    setSeries((prev) => {
      const next = [
        ...prev,
        {
          t,
          calor:  sensors.find((s) => s.id === "S_calor")?.value  ?? 0,
          fumaca: sensors.find((s) => s.id === "S_fumaca")?.value ?? 0,
          glp:    sensors.find((s) => s.id === "S_GLP")?.value    ?? 0,
        },
      ];
      return next.slice(-20);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  // Modal de alerta crítico ao mudar de status
  useEffect(() => {
    if (status === lastStatus.current) return;
    lastStatus.current = status;

    if (status === "fire") {
      setCriticalAlert({
        id: "fire",
        title: "Incêndio detectado",
        message: "Calor e fumaça em níveis críticos. Sistema acionou supressão automaticamente.",
      });
    } else if (status === "explosion") {
      setCriticalAlert({
        id: "explosion",
        title: "Nível de gás crítico",
        message: "Concentração de GLP acima do limite. Válvula fechada automaticamente. Não acione interruptores.",
      });
    } else if (status === "emergency") {
      setCriticalAlert({
        id: "emergency",
        title: "Emergência geral ativada",
        message: "Todos os protocolos de segurança foram acionados.",
      });
    }
  }, [status]);

  // Modal por sensor crítico independente
  useEffect(() => {
    const glp = sensors.find((s) => s.id === "S_GLP");
    if (glp?.state === "danger" && !dismissedAlerts.current.has("glp")) {
      setCriticalAlert({
        id: "glp",
        title: "Nível de gás crítico detectado",
        message: `Concentração de GLP em ${Math.round(glp.value)} ppm. Acione protocolos de segurança imediatamente.`,
      });
      dismissedAlerts.current.add("glp");
    }
    if (glp?.state === "ok") dismissedAlerts.current.delete("glp");
  }, [sensors]);

  // ── Handler unificado de ações ──────────────────────────────────────────────
  async function handleAction(a: string) {
    switch (a) {
      case "fire":      await simulateEvent("fire");    break;
      case "gas":       await simulateEvent("gas");     break;
      case "smoke":     await simulateEvent("smoke");   break;
      case "motion":    await simulateEvent("motion");  break;
      case "emergency": await triggerEmergency();       break;
      case "reset":
      case "clear":
        await resetSystem();
        await clearAlerts();
        setCriticalAlert(null);
        dismissedAlerts.current.clear();
        break;
      case "test":
        // Apenas visual — não persiste
        break;
    }
  }

  const time = now.toLocaleTimeString("pt-BR", { hour12: false });
  const date = now.toLocaleDateString("pt-BR");
  const alertCount = alerts.filter(
    (a) => a.level === "danger" || a.level === "critical" || a.level === "warning",
  ).length;

  // ── Banner de erro de conexão ───────────────────────────────────────────────
  if (error && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="max-w-lg rounded-2xl border border-status-danger/50 bg-card p-8 text-center">
          <div className="mb-3 text-4xl">🔌</div>
          <h2 className="mb-2 text-lg font-bold text-status-danger">API Desconectada</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="mt-4 rounded-lg bg-background/60 p-3 font-mono text-xs text-muted-foreground">
            cd API &amp;&amp; npm run dev
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar
        time={time} date={date} status={status}
        sensorsOnline={sensors.length} totalSensors={sensors.length}
      />

      <main className="flex-1 space-y-4 overflow-x-hidden p-4 lg:p-6">
        {/* Banner de erro não-fatal (API lenta / timeout momentâneo) */}
        {error && (
          <div className="rounded-xl border border-status-warning/50 bg-status-warning/10 px-4 py-2 text-xs text-status-warning">
            ⚠️ {error}
          </div>
        )}

        {/* Loading inicial */}
        {loading && (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs text-muted-foreground">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-status-info" />
            Conectando à API...
          </div>
        )}

        <TopBar status={status} alertCount={alertCount} time={time} date={date} />

        <ManualControls
          actuators={actuators}
          manualOverrides={manualOverrides}
          onToggle={toggleActuator}
        />

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {sensors.map((s) => <KpiCard key={s.id} sensor={s} />)}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <KitchenView sensors={sensors} status={status} />
            <div className="grid gap-4 md:grid-cols-2">
              <EventHistory alerts={alerts} />
              <RealtimeCharts data={series} />
            </div>
          </div>
          <div className="space-y-4">
            <EmergencyButton
              onClick={() => handleAction("emergency")}
              active={status === "emergency"}
            />
            <ActuatorGrid
              actuators={actuators}
              manualOverrides={manualOverrides}
              onToggle={toggleActuator}
            />
            <SystemStatusCard status={status} sensors={sensors} />
          </div>
        </section>

        <section>
          <QuickControls onAction={handleAction} />
        </section>
      </main>

      <CriticalAlertModal
        alert={criticalAlert}
        onClose={() => setCriticalAlert(null)}
      />
    </div>
  );
};

export default Index;