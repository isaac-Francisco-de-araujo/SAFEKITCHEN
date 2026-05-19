import { parser } from "./arduino";

parser.on("data", (dados) => {

  try {

    const sensores = JSON.parse(dados);

    console.log("Sensores:", sensores);

    // salvar no banco
    // emitir websocket
    // criar notificacao

  } catch (erro) {

    console.log("Erro ao ler JSON");
  }
});