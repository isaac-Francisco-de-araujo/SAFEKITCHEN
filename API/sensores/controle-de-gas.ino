//  SISTEMA DE CONTROLE DE GÁS - COZINHA INDUSTRIAL

#include <Arduino.h>

// PINOS
const int sensorGasPin = A0;   // Sensor MQ (analógico)
const int valvulaPin = 8;      // Relé ou servo da válvula
const int ledAlerta = 13;      // LED de alerta

// CONFIG
int limiteGas = 400; // Ajuste conforme sensor

// VARIÁVEIS
bool vazamentoDetectado = false;
String comando = "";

void setup() {
  Serial.begin(9600);

  pinMode(valvulaPin, OUTPUT);
  pinMode(ledAlerta, OUTPUT);

  digitalWrite(valvulaPin, HIGH); // Válvula ABERTA inicialmente
  digitalWrite(ledAlerta, LOW);

  Serial.println("Sistema de gás iniciado");
}

void loop() {

  //  Ler nível de gás
  int valorGas = analogRead(sensorGasPin);

  //  DETECÇÃO DE VAZAMENTO
  if (valorGas > limiteGas && !vazamentoDetectado) {
    vazamentoDetectado = true;

    Serial.println("GAS_DETECTADO");

    fecharValvula();
  }

  // Normalizou
  if (valorGas <= limiteGas && vazamentoDetectado) {
    vazamentoDetectado = false;

    Serial.println("GAS_NORMAL");
  }

  //  RECEBER COMANDOS
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

//  COMANDOS
void processarComando(String cmd) {
  cmd.trim();

  if (cmd == "FECHAR_GAS") {
    fecharValvula();
    Serial.println("VALVULA_FECHADA");
  }
  else if (cmd == "ABRIR_GAS") {
    abrirValvula();
    Serial.println("VALVULA_ABERTA");
  }
  else if (cmd == "STATUS") {
    enviarStatus();
  }
  else {
    Serial.println("CMD_INVALIDO");
  }
}

//  FECHAR VÁLVULA
void fecharValvula() {
  digitalWrite(valvulaPin, LOW); // Relé OFF = fechado
  digitalWrite(ledAlerta, HIGH);

  Serial.println("FECHANDO_GAS");
}

//  ABRIR VÁLVULA
void abrirValvula() {
  digitalWrite(valvulaPin, HIGH);
  digitalWrite(ledAlerta, LOW);

  Serial.println("ABRINDO_GAS");
}

//  STATUS
void enviarStatus() {
  int valorGas = analogRead(sensorGasPin);

  Serial.print("STATUS:");
  Serial.print("GAS=");
  Serial.print(valorGas);
  Serial.print(",VALVULA=");
  Serial.print(digitalRead(valvulaPin));
  Serial.print(",ALERTA=");
  Serial.println(vazamentoDetectado);
}
