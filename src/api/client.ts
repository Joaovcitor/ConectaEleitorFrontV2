import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message ?? error.response?.data ?? error.message;
    return typeof message === "string" ? message : "Não foi possível concluir a operação.";
  }

  return "Ocorreu um erro inesperado.";
}
