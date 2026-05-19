import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

export const portaArduino = new SerialPort({
  path: "COM3",
  baudRate: 9600
});

export const parser = portaArduino.pipe(
  new ReadlineParser({
    delimiter: "\n"
  })
);

portaArduino.on("open", () => {
  console.log("Arduino conectado");
});