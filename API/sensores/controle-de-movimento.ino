#include <Arduino.h> // Biblioteca para controle do Arduino
const int PIN_PIR = 7; // Pino digital para o sensor de movimento

bool movimento = false;

void iniciarMovimento() {
  pinMode(PIN_PIR, INPUT);
}

void lerMovimento() {
  movimento = digitalRead(PIN_PIR);
}