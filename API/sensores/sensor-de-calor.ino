// SISTEMA DE CONTROLE DE CALOR - COZINHA INDUSTRIAL

#include <Arduino.h>

// PINOS
const int sensorCalorPin = A1;  // Sensor de temperatura analógico (ex: LM35, NTC)
const int ledAlerta = 12;       // LED de alerta
const int ledIncendio = 11;     // LED de incêndio

// CONFIG
int limiteAlerta   = 60;  // Temperatura em °C para ALERTA
int limiteIncendio = 80;  // Temperatura em °C para INCÊNDIO

// VARIÁVEIS
bool alertaAtivo    = false;
bool incendioAtivo  = false;
String comando      = "";

// FUMAÇA (recebido via serial do outro módulo)
bool fumacaDetectada = false;

void setup() {
  Serial.begin(9600);

  pinMode(ledAlerta,   OUTPUT);
  pinMode(ledIncendio, OUTPUT);

  digitalWrite(ledAlerta,   LOW);
  digitalWrite(ledIncendio, LOW);

  Serial.println("Sistema de calor iniciado");
}

void loop() {

  // Ler temperatura (LM35: 10mV/°C → 5V ref → (leitura * 500.0) / 1023)
  int leitura      = analogRead(sensorCalorPin);
  float temperatura = (leitura * 500.0) / 1023.0;

  // DETECÇÃO DE INCÊNDIO (calor alto + fumaça)
  if (temperatura >= limiteIncendio || (temperatura >= limiteAlerta && fumacaDetectada)) {
    if (!incendioAtivo) {
      incendioAtivo = true;
      alertaAtivo   = true;

      Serial.println("INCENDIO_DETECTADO");
      ativarIncendio();
    }
  }
  // DETECÇÃO DE ALERTA (calor alto, sem fumaça)
  else if (temperatura >= limiteAlerta) {
    if (!alertaAtivo) {
      alertaAtivo   = true;
      incendioAtivo = false;

      Serial.println("CALOR_ALERTA");
      ativarAlerta();
    }
  }
  // NORMALIZADO
  else {
    if (alertaAtivo || incendioAtivo) {
      alertaAtivo   = false;
      incendioAtivo = false;

      Serial.println("CALOR_NORMAL");
      desativarAlertas();
    }
  }

  // RECEBER COMANDOS
  while (Serial.available() > 0) {
    char c = Serial.read();

    if (c == '\n') {
      processarComando(comando);
      comando = "";
    } else {
      comando += c;
    }
  }

  delay(200);
}

// COMANDOS
void processarComando(String cmd) {
  cmd.trim();

  if (cmd == "STATUS") {
    enviarStatus();
  }
  else if (cmd == "FUMACA_ON") {
    fumacaDetectada = true;
    Serial.println("FUMACA_RECEBIDA");
  }
  else if (cmd == "FUMACA_OFF") {
    fumacaDetectada = false;
    Serial.println("FUMACA_LIMPA");
  }
  else if (cmd == "RESET_ALERTA") {
    alertaAtivo   = false;
    incendioAtivo = false;
    desativarAlertas();
    Serial.println("ALERTA_RESETADO");
  }
  else {
    Serial.println("CMD_INVALIDO");
  }
}

// ATIVAR ALERTA DE CALOR
void ativarAlerta() {
  digitalWrite(ledAlerta,   HIGH);
  digitalWrite(ledIncendio, LOW);

  Serial.println("ATIVANDO_ALERTA_CALOR");
}

// ATIVAR ALERTA DE INCÊNDIO
void ativarIncendio() {
  digitalWrite(ledAlerta,   HIGH);
  digitalWrite(ledIncendio, HIGH);

  Serial.println("ATIVANDO_ALERTA_INCENDIO");
}

// DESATIVAR TODOS OS ALERTAS
void desativarAlertas() {
  digitalWrite(ledAlerta,   LOW);
  digitalWrite(ledIncendio, LOW);

  Serial.println("DESATIVANDO_ALERTAS");
}

// STATUS
void enviarStatus() {
  int leitura       = analogRead(sensorCalorPin);
  float temperatura = (leitura * 500.0) / 1023.0;

  Serial.print("STATUS:");
  Serial.print("TEMP=");
  Serial.print(temperatura);
  Serial.print(",ALERTA=");
  Serial.print(alertaAtivo);
  Serial.print(",INCENDIO=");
  Serial.print(incendioAtivo);
  Serial.print(",FUMACA=");
  Serial.println(fumacaDetectada);
}
