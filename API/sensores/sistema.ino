#include <Arduino.h>
bool incendio = false ;// Variável para indicar se um incêndio foi detectado

void iniciarSistema() {
  incendio = false;
}

void executarSistema() {

  if (alertaGas || (alertaFumaca && alertaCalor)) { // Condição para detectar incêndio
    incendio = true;

    Serial.println("INCENDIO_DETECTADO");
  }
  else {
    incendio = false;
  }

  if (movimento && incendio) {
    Serial.println("RISCO_PESSOA_PRESENTE");
  }
}