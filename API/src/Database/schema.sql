-- =========================
-- STATUS DO SISTEMA
-- =========================
CREATE TABLE IF NOT EXISTS status_sistema (
  id INTEGER PRIMARY KEY,

  -- Sensores (0 = falso, 1 = verdadeiro)
  calor INTEGER DEFAULT 0,
  fumaca INTEGER DEFAULT 0,
  glp INTEGER DEFAULT 0,
  movimento INTEGER DEFAULT 0,

  -- Funções / Atuadores
  ventilacao INTEGER DEFAULT 0,
  gas INTEGER DEFAULT 0,
  bomba INTEGER DEFAULT 0,
  tomadas INTEGER DEFAULT 0,

  -- Estado geral
  estado_geral TEXT DEFAULT 'NORMAL',

  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inserir estado inicial (evita duplicação)
INSERT INTO status_sistema (
  id, calor, fumaca, glp, movimento,
  ventilacao, gas, bomba, tomadas,
  estado_geral
)
SELECT 
  1, 0, 0, 0, 0,
  1, 1, 0, 1,
  'NORMAL'
WHERE NOT EXISTS (
  SELECT 1 FROM status_sistema WHERE id = 1
);

-- =========================
-- EVENTOS (LOG)
-- =========================
CREATE TABLE IF NOT EXISTS eventos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  tipo TEXT,        -- ALERTA, INCENDIO, EMERGENCIA
  mensagem TEXT,

  sensor TEXT,
  atuador TEXT,

  data_hora DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- HISTÓRICO DE SENSORES
-- =========================
CREATE TABLE IF NOT EXISTS historico_sensores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  calor INTEGER,
  fumaca INTEGER,
  glp INTEGER,
  movimento INTEGER,

  data_hora DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- NOTIFICAÇÕES
-- =========================
CREATE TABLE IF NOT EXISTS notificacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  tipo TEXT,
  destino TEXT,

  mensagem TEXT,
  enviado INTEGER DEFAULT 0,

  data_hora DATETIME DEFAULT CURRENT_TIMESTAMP
);