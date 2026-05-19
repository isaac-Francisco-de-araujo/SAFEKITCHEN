// =========================================
// SAFEKITCHEN - SISTEMA COMPLETO
// =========================================

// ---------- SENSORES ----------

const int PIN_GAS = A0;
const int PIN_FUMACA = A1;
const int PIN_CALOR = A2;
const int PIN_MOVIMENTO = 2;

// ---------- ATUADORES ----------

const int PIN_VENTILACAO = 12;
const int PIN_ALARME = 11;
const int PIN_VALVULA_GLP = 10;
const int PIN_TOMADAS = 13;

// ---------- VARIAVEIS ----------

int valorGas = 0;
int valorFumaca = 0;
int valorTemperatura = 0;

bool movimento = false;

bool emergenciaAtiva = false;

// ---------- LIMITES ----------

const int LIMITE_GAS_ALERTA = 350;
const int LIMITE_GAS_CRITICO = 600;

const int LIMITE_FUMACA_ALERTA = 300;
const int LIMITE_FUMACA_CRITICO = 600;

const int LIMITE_CALOR_CRITICO = 700;

// =========================================
// SETUP
// =========================================

void setup() {

  Serial.begin(9600);

  // sensores

  pinMode(PIN_GAS, INPUT);
  pinMode(PIN_FUMACA, INPUT);
  pinMode(PIN_CALOR, INPUT);
  pinMode(PIN_MOVIMENTO, INPUT);

  // atuadores

  pinMode(PIN_VENTILACAO, OUTPUT);
  pinMode(PIN_ALARME, OUTPUT);
  pinMode(PIN_VALVULA_GLP, OUTPUT);
  pinMode(PIN_TOMADAS, OUTPUT);

  // estado inicial

  digitalWrite(PIN_VENTILACAO, LOW);

  digitalWrite(PIN_ALARME, LOW);

  // válvula aberta
  digitalWrite(PIN_VALVULA_GLP, HIGH);

  // tomadas ligadas
  digitalWrite(PIN_TOMADAS, HIGH);
}

// =========================================
// LOOP
// =========================================

void loop() {

  lerSensores();

  verificarEmergencia();

  enviarDados();

  receberComandos();

  delay(500);
}

// =========================================
// LEITURA DOS SENSORES
// =========================================

void lerSensores() {

  valorGas = analogRead(PIN_GAS);

  valorFumaca = analogRead(PIN_FUMACA);

  valorTemperatura = analogRead(PIN_CALOR);

  movimento = digitalRead(PIN_MOVIMENTO);
}

// =========================================
// VERIFICAR EMERGENCIA
// =========================================

void verificarEmergencia() {

  // ---------- ALERTA MEDIO ----------

  if (
    valorGas > LIMITE_GAS_ALERTA ||
    valorFumaca > LIMITE_FUMACA_ALERTA
  ) {

    digitalWrite(PIN_VENTILACAO, HIGH);
  }

  else {

    if (!emergenciaAtiva) {

      digitalWrite(PIN_VENTILACAO, LOW);
    }
  }

  // ---------- ALERTA CRITICO ----------

  if (
    valorGas > LIMITE_GAS_CRITICO ||
    valorFumaca > LIMITE_FUMACA_CRITICO ||
    valorTemperatura > LIMITE_CALOR_CRITICO
  ) {

    ativarEmergencia();
  }
}

// =========================================
// ATIVAR EMERGENCIA
// =========================================

void ativarEmergencia() {

  emergenciaAtiva = true;

  // ventilacao ligada

  digitalWrite(PIN_VENTILACAO, HIGH);

  // alarme ligado

  digitalWrite(PIN_ALARME, HIGH);

  // fecha válvula GLP

  digitalWrite(PIN_VALVULA_GLP, LOW);

  // corta tomadas

  digitalWrite(PIN_TOMADAS, LOW);

  Serial.println("EMERGENCIA_ATIVA");
}

// =========================================
// DESATIVAR EMERGENCIA
// =========================================

void desativarEmergencia() {

  emergenciaAtiva = false;

  digitalWrite(PIN_ALARME, LOW);

  digitalWrite(PIN_VENTILACAO, LOW);

  // abre válvula GLP

  digitalWrite(PIN_VALVULA_GLP, HIGH);

  // liga tomadas

  digitalWrite(PIN_TOMADAS, HIGH);

  Serial.println("EMERGENCIA_DESATIVADA");
}

// =========================================
// ENVIAR DADOS PARA O BACK-END
// =========================================

void enviarDados() {

  Serial.print("{");

  Serial.print("\"gas\":");
  Serial.print(valorGas);
  Serial.print(",");

  Serial.print("\"fumaca\":");
  Serial.print(valorFumaca);
  Serial.print(",");

  Serial.print("\"temperatura\":");
  Serial.print(valorTemperatura);
  Serial.print(",");

  Serial.print("\"movimento\":");
  Serial.print(movimento ? "true" : "false");
  Serial.print(",");

  Serial.print("\"emergencia\":");
  Serial.print(emergenciaAtiva ? "true" : "false");
  Serial.print(",");

  Serial.print("\"ventilacao\":");
  Serial.print(digitalRead(PIN_VENTILACAO) ? "true" : "false");
  Serial.print(",");

  Serial.print("\"alarme\":");
  Serial.print(digitalRead(PIN_ALARME) ? "true" : "false");
  Serial.print(",");

  Serial.print("\"valvulaGLP\":");
  Serial.print(digitalRead(PIN_VALVULA_GLP) ? "true" : "false");
  Serial.print(",");

  Serial.print("\"tomadas\":");
  Serial.print(digitalRead(PIN_TOMADAS) ? "true" : "false");

  Serial.println("}");
}

// =========================================
// RECEBER COMANDOS DO BACK-END
// =========================================

void receberComandos() {

  if (Serial.available()) {

    String comando = Serial.readStringUntil('\n');

    comando.trim();

    // ---------- EMERGENCIA ----------

    if (comando == "EMERGENCIA_ON") {

      ativarEmergencia();
    }

    if (comando == "EMERGENCIA_OFF") {

      desativarEmergencia();
    }

    // ---------- VENTILACAO ----------

    if (comando == "VENTILACAO_ON") {

      digitalWrite(PIN_VENTILACAO, HIGH);
    }

    if (comando == "VENTILACAO_OFF") {

      digitalWrite(PIN_VENTILACAO, LOW);
    }

    // ---------- ALARME ----------

    if (comando == "ALARME_ON") {

      digitalWrite(PIN_ALARME, HIGH);
    }

    if (comando == "ALARME_OFF") {

      digitalWrite(PIN_ALARME, LOW);
    }

    // ---------- VALVULA GLP ----------

    if (comando == "GLP_ON") {

      digitalWrite(PIN_VALVULA_GLP, HIGH);
    }

    if (comando == "GLP_OFF") {

      digitalWrite(PIN_VALVULA_GLP, LOW);
    }

    // ---------- TOMADAS ----------

    if (comando == "TOMADAS_ON") {

      digitalWrite(PIN_TOMADAS, HIGH);
    }

    if (comando == "TOMADAS_OFF") {

      digitalWrite(PIN_TOMADAS, LOW);
    }
  }
}