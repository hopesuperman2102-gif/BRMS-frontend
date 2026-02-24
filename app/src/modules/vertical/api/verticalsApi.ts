import { ENV } from '../../../config/env';
import axiosInstance from '../../auth/Axiosinstance';


export interface VerticalView {
  id: string;
  vertical_key: string;
  vertical_name: string;
  description: string;
}

export const verticalsApi = {
  getVerticalsView: async (): Promise<VerticalView[]> => {
    const response = await axiosInstance.get<VerticalView[]>(`${ENV.API_BASE_URL}/api/v1/verticals`);
    return response.data;
  },

  getVerticalKeyById: async (id: string): Promise<string> => {
    const verticals = await verticalsApi.getVerticalsView();
    const vertical = verticals.find((v) => v.id === id);
    if (!vertical) throw new Error('Vertical not found');
    return vertical.vertical_key;
  },
};