const API_URL = "http://localhost:3000";

// STATUS SISTEMA

export async function getStatusSistema() {
  const response = await fetch(
    `${API_URL}/status-sistema`
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar status");
  }

  return response.json();
}

export async function atualizarStatusSistema(data: any) {
  const response = await fetch(
    `${API_URL}/status-sistema`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao atualizar status");
  }

  return response.json();
}

export async function resetarSistema() {
  const response = await fetch(
    `${API_URL}/status-sistema/resetar`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao resetar sistema");
  }

  return response.json();
}
// EVENTOS

export async function listarEventos() {
  const response = await fetch(
    `${API_URL}/eventos`
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar eventos");
  }

  return response.json();
}

export async function criarEvento(data: any) {
  const response = await fetch(
    `${API_URL}/eventos`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao criar evento");
  }

  return response.json();
}

// HISTÓRICO

export async function listarHistorico() {
  const response = await fetch(
    `${API_URL}/historico-sensores`
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar histórico");
  }

  return response.json();
}

export async function criarHistorico(data: any) {
  const response = await fetch(
    `${API_URL}/historico-sensores`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao salvar histórico");
  }

  return response.json();
}
// NOTIFICAÇÕES

export async function listarNotificacoes() {
  const response = await fetch(
    `${API_URL}/notificacoes`
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar notificações");
  }

  return response.json();
}

export async function criarNotificacao(data: any) {
  const response = await fetch(
    `${API_URL}/notificacoes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao criar notificação");
  }

  return response.json();
}