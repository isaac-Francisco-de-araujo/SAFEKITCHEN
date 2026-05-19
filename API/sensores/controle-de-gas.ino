#include <Arduino.h>
const int PIN_GAS = A0; //  Pino analógico para o sensor de gás

int valorGas = 0; // Variável para armazenar o valor do sensor de gás
bool alertaGas = false;

void iniciarGas() {
  pinMode(PIN_GAS, INPUT);
}

void lerGas() {
  valorGas = analogRead(PIN_GAS);

  alertaGas = valorGas > 400;
}