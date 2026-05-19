#include <Arduino.h>

const int PIN_FUMACA = A2; // Pino analógico para o sensor de fumaça

int valorFumaca = 0;
bool alertaFumaca = false;

void iniciarFumaca() {
  pinMode(PIN_FUMACA, INPUT);
}

void lerFumaca() {
  valorFumaca = analogRead(PIN_FUMACA);

  alertaFumaca = valorFumaca > 350;
}