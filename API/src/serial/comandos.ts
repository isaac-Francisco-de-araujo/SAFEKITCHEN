import { portaArduino } from "./arduino";

export function ligarVentilacao() {

  portaArduino.write("VENTILACAO_ON\n");
}

export function desligarVentilacao() {

  portaArduino.write("VENTILACAO_OFF\n");
}

export function ativarEmergencia() {

  portaArduino.write("EMERGENCIA_ON\n");
}

export function desativarEmergencia() {

  portaArduino.write("EMERGENCIA_OFF\n");
}