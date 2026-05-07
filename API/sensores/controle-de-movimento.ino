// SISTEMA DE CONTROLE DE MOVIMENTO - COZINHA INDUSTRIAL

#include <Arduino.h>

// PINOS
const int sensorPIRPin  = 7;   // Sensor PIR (digital)
const int ledPresenca   = 6;   // LED indicador de presença
const int ledRisco      = 5;   // LED de risco com pessoa presente

// CONFIG
const unsigned long tempoSemMovimento = 10000; // 10s sem movimento para considerar ambiente vazio

// VARIÁVEIS
bool presencaDetectada    = false;
bool ambienteVazio        = true;
bool incendioAtivo        = false;   // Recebido via serial dos outros módulos
unsigned long ultimoMovimento = 0;
String comando            = "";

void setup() {
  Serial.begin(9600);

  pinMode(sensorPIRPin, INPUT);
  pinMode(ledPresenca,  OUTPUT);
  pinMode(ledRisco,     OUTPUT);

  digitalWrite(ledPresenca, LOW);
  digitalWrite(ledRisco,    LOW);

  Serial.println("Sistema de movimento iniciado");
}

void loop() {

  // Ler PIR
  bool movimentoAtual = digitalRead(sensorPIRPin);

  // MOVIMENTO DETECTADO
  if (movimentoAtual && !presencaDetectada) {
    presencaDetectada = true;
    ambienteVazio     = false;
    ultimoMovimento   = millis();

    Serial.println("MOVIMENTO_DETECTADO");
    digitalWrite(ledPresenca, HIGH);

    // Se há incêndio ativo e tem pessoa → risco imediato
    if (incendioAtivo) {
      Serial.println("RISCO_PESSOA_PRESENTE");
      digitalWrite(ledRisco, HIGH);
    }
  }

  // Atualiza timestamp a cada pulso do PIR
  if (movimentoAtual) {
    ultimoMovimento = millis();
  }

  // TEMPO SEM MOVIMENTO → ambiente vazio
  if (presencaDetectada && (millis() - ultimoMovimento >= tempoSemMovimento)) {
    presencaDetectada = false;
    ambienteVazio     = true;

    Serial.println("AMBIENTE_VAZIO");
    Serial.println("PESSOA_AUSENTE");   // Notifica demais módulos
    digitalWrite(ledPresenca, LOW);
    digitalWrite(ledRisco,    LOW);
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
  else if (cmd == "INCENDIO_ON") {
    incendioAtivo = true;

    // Se já tem pessoa no ambiente → emite risco imediatamente
    if (presencaDetectada) {
      Serial.println("RISCO_PESSOA_PRESENTE");
      digitalWrite(ledRisco, HIGH);
    } else {
      // Ambiente vazio → libera supressão automática
      Serial.println("LIVRE_SUPRESSAO");
    }
  }
  else if (cmd == "INCENDIO_OFF") {
    incendioAtivo = false;
    digitalWrite(ledRisco, LOW);
    Serial.println("INCENDIO_ENCERRADO");
  }
  else if (cmd == "RESET") {
    presencaDetectada = false;
    ambienteVazio     = true;
    incendioAtivo     = false;
    digitalWrite(ledPresenca, LOW);
    digitalWrite(ledRisco,    LOW);
    Serial.println("SISTEMA_RESETADO");
  }
  else {
    Serial.println("CMD_INVALIDO");
  }
}

// STATUS
void enviarStatus() {
  bool movimentoAtual = digitalRead(sensorPIRPin);

  Serial.print("STATUS:");
  Serial.print("PIR=");
  Serial.print(movimentoAtual);
  Serial.print(",PRESENCA=");
  Serial.print(presencaDetectada);
  Serial.print(",VAZIO=");
  Serial.print(ambienteVazio);
  Serial.print(",INCENDIO=");
  Serial.print(incendioAtivo);
  Serial.print(",ULTIMO_MOV=");
  Serial.println(millis() - ultimoMovimento);
}
