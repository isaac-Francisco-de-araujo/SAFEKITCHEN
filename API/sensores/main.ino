#include <Arduino.h> 

void setup() {
  Serial.begin(9600); // Inicia a comunicação serial

  iniciarGas(); // Inicializa o sensor de gás
  iniciarFumaca();
  iniciarCalor();
  iniciarMovimento();

  iniciarSistema();
}

void loop() { // Lê os sensores
  lerGas();
  lerFumaca();
  lerCalor();
  lerMovimento();

  executarSistema(); // Verifica as condições do sistema

  enviarSerial(); // Envia os dados para o monitor serial

  delay(200);   // Aguarda um curto período antes da próxima leitura
}