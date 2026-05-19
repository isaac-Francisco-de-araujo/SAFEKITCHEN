#include <Arduino.h>
const int PIN_CALOR = A1; // Pino analógico para o sensor de calor 

int valorCalor = 0;
bool alertaCalor = false;

void iniciarCalor() {
  pinMode(PIN_CALOR, INPUT);
}

void lerCalor() {
  valorCalor = analogRead(PIN_CALOR);

  alertaCalor = valorCalor > 60;
}