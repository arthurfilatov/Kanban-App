import { type ColumnType } from "../types";

const BASE_URL = "http://localhost:8000/api";

export const kanbanApi = {
  async getColumns(): Promise<ColumnType[]> {
    const response = await fetch(`${BASE_URL}/columns`);
    if (!response.ok) {
      throw new Error(`Ошибка загрузки: ${response.status}`);
    }
    return response.json();
  },

  async updateBoard(columns: ColumnType[]): Promise<void> {
    const response = await fetch(`${BASE_URL}/columns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(columns),
    });
    if (!response.ok) {
      throw new Error(`Ошибка сохранения: ${response.status}`);
    }
  },
};
