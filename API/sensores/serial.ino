#include <Arduino.h>

void enviarSerial() { // Envia os dados dos sensores para o monitor serial

  Serial.print("GAS:");
  Serial.print(valorGas);

  Serial.print(",FUMACA:");
  Serial.print(valorFumaca);

  Serial.print(",CALOR:");
  Serial.print(valorCalor);

  Serial.print(",MOV:");
  Serial.print(movimento);

  Serial.print(",INCENDIO:");
  Serial.println(incendio);
}