// SISTEMA DE CONTROLE DE FUMAÇA - COZINHA INDUSTRIAL

#include <Arduino.h>

// PINOS
const int sensorFumacaPin = A2;  // Sensor MQ-2 / MQ-135 (analógico)
const int ledAlerta       = 10;  // LED de alerta de fumaça
const int ledIncendio     = 9;   // LED de incêndio (fumaça + calor)

// CONFIG
int limiteFumaca = 350;  // Ajuste conforme sensor e ambiente

// VARIÁVEIS
bool fumacaDetectada = false;
bool incendioAtivo   = false;
bool calorDetectado  = false;   // Recebido via serial do módulo de calor
String comando       = "";

void setup() {
  Serial.begin(9600);

  pinMode(ledAlerta,   OUTPUT);
  pinMode(ledIncendio, OUTPUT);

  digitalWrite(ledAlerta,   LOW);
  digitalWrite(ledIncendio, LOW);

  Serial.println("Sistema de fumaca iniciado");
}

void loop() {

  // Ler nível de fumaça
  int valorFumaca = analogRead(sensorFumacaPin);

  // DETECÇÃO DE FUMAÇA
  if (valorFumaca > limiteFumaca && !fumacaDetectada) {
    fumacaDetectada = true;

    // Fumaça + Calor = INCÊNDIO
    if (calorDetectado) {
      incendioAtivo = true;
      Serial.println("INCENDIO_DETECTADO");
      ativarIncendio();
    } else {
      Serial.println("FUMACA_DETECTADA");
      ativarAlertaFumaca();
    }

    // Notifica módulo de calor
    Serial.println("FUMACA_ON");
  }

  // CALOR RECÉM DETECTADO COM FUMAÇA JÁ ATIVA → vira incêndio
  if (fumacaDetectada && calorDetectado && !incendioAtivo) {
    incendioAtivo = true;
    Serial.println("INCENDIO_DETECTADO");
    ativarIncendio();
  }

  // NORMALIZADO
  if (valorFumaca <= limiteFumaca && fumacaDetectada) {
    fumacaDetectada = false;
    incendioAtivo   = false;

    Serial.println("FUMACA_NORMAL");
    Serial.println("FUMACA_OFF");   // Notifica módulo de calor
    desativarAlertas();
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
  else if (cmd == "CALOR_ON") {
    calorDetectado = true;
    Serial.println("CALOR_RECEBIDO");
  }
  else if (cmd == "CALOR_OFF") {
    calorDetectado = false;
    Serial.println("CALOR_LIMPO");
  }
  else if (cmd == "RESET_ALERTA") {
    fumacaDetectada = false;
    incendioAtivo   = false;
    desativarAlertas();
    Serial.println("ALERTA_RESETADO");
  }
  else {
    Serial.println("CMD_INVALIDO");
  }
}

// ATIVAR ALERTA DE FUMAÇA
void ativarAlertaFumaca() {
  digitalWrite(ledAlerta,   HIGH);
  digitalWrite(ledIncendio, LOW);

  Serial.println("ATIVANDO_ALERTA_FUMACA");
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
  int valorFumaca = analogRead(sensorFumacaPin);

  Serial.print("STATUS:");
  Serial.print("FUMACA=");
  Serial.print(valorFumaca);
  Serial.print(",DETECTADA=");
  Serial.print(fumacaDetectada);
  Serial.print(",CALOR=");
  Serial.print(calorDetectado);
  Serial.print(",INCENDIO=");
  Serial.println(incendioAtivo);
}
