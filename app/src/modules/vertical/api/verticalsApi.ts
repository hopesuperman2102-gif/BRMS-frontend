// src/api/verticalsApi.ts
import { ENV } from '../../../config/env';

const API_BASE_URL = ENV.API_BASE_URL;

export interface VerticalView {
  id: string;
  vertical_key: string;
  vertical_name: string;
}

export const verticalsApi = {
  // Get all verticals
  getVerticalsView: async (): Promise<VerticalView[]> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/verticals`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch verticals');
    }

    const result = (await response.json()) as VerticalView[];
    return result;
  },

  // Get vertical_key by id
  getVerticalKeyById: async (id: string): Promise<string> => {
    const verticals = await verticalsApi.getVerticalsView();
    const vertical = verticals.find((v) => v.id === id);
    if (!vertical) {
      throw new Error('Vertical not found');
    }
    return vertical.vertical_key;
  },
};