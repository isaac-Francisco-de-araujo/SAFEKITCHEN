SAFEKITCHEN

Sistema inteligente de segurança para cozinhas industriais com monitoramento em tempo real, integração com Arduino e controle de atuadores.

 Sobre o Projeto

O SAFEKITCHEN é uma plataforma desenvolvida para aumentar a segurança em cozinhas industriais através de sensores, automação e monitoramento em tempo real.

O sistema integra:

Front-end moderno e responsivo
Back-end em Node.js
Comunicação em tempo real com Socket.IO
Integração com Arduino via porta serial
Monitoramento de sensores
Controle de ventilação e emergência
Dashboard operacional

Projeto desenvolvido com foco em automação, prevenção de acidentes e resposta rápida em situações críticas.

 Tecnologias Utilizadas
Front-end
React
TypeScript
Tailwind CSS
Socket.IO
Lucide
shadcn/ui
Back-end
Node.js
Express.js
Socket.IO
SerialPort
Hardware
Arduino
Sensores de gás
Sensores de temperatura
Atuadores
Sistema de ventilação
 Funcionalidades

 Monitoramento em tempo real
 Comunicação com Arduino
 Dashboard interativo
 Controle de ventilação
 Sistema de emergência
 Histórico de eventos
 Gráficos em tempo real
 Atualização instantânea via WebSocket
 Interface responsiva

 Interface do Sistema

O sistema possui:

Painel de monitoramento
Status dos sensores
Alertas visuais
Controle de atuadores
Histórico operacional
Indicadores em tempo real
 Estrutura do Projeto
SAFEKITCHEN/
│
├── backend/
│   ├── src/
│   ├── routes/
│   ├── services/
│   └── arduino/
│
├── web/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── services/
│
└── arduino/
    └── codigo_arduino.ino
     Instalação
 Clone o repositório
git clone https://github.com/isaac-Francisco-de-araujo/SAFEKITCHEN.git
 Instale as dependências
Front-end
cd web
npm install
Back-end
cd backend
npm install
▶ Executando o Projeto
Front-end
npm run dev
Back-end
npm run dev
 Comunicação com Arduino

O sistema utiliza comunicação serial para integração com o Arduino.

Exemplo:

portaArduino.write("VENTILACAO_ON\n");

Comandos disponíveis:

Comando	Função
VENTILACAO_ON	Liga ventilação
VENTILACAO_OFF	Desliga ventilação
EMERGENCIA_ON	Ativa emergência
EMERGENCIA_OFF	Desativa emergência
 Comunicação em Tempo Real

O SAFEKITCHEN utiliza Socket.IO para atualização instantânea dos dados entre servidor e interface.

 Objetivo

O objetivo do SAFEKITCHEN é fornecer uma solução tecnológica para prevenção de acidentes em cozinhas industriais, permitindo monitoramento contínuo e resposta automática a situações de risco.

 Desenvolvedor

Desenvolvido por Isaac Francisco de Araujo
