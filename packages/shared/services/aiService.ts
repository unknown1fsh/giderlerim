import { AxiosInstance } from 'axios';
import { ApiResponse } from '../types/api.types';
import { AiAnalizResponse, SohbetMesajiResponse, SohbetOturumResponse } from '../types/ai.types';

export function createAiAnalizService(client: AxiosInstance) {
  return {
    async harcamaAnaliziYap(ay: number, yil: number): Promise<ApiResponse<AiAnalizResponse>> {
      const response = await client.get<ApiResponse<AiAnalizResponse>>('/ai/analiz/harcama', { params: { ay, yil } });
      return response.data;
    },

    async butceOnerisiAl(): Promise<ApiResponse<AiAnalizResponse>> {
      const response = await client.get<ApiResponse<AiAnalizResponse>>('/ai/analiz/butce-onerisi');
      return response.data;
    },

    async anomaliTespitEt(): Promise<ApiResponse<AiAnalizResponse>> {
      const response = await client.get<ApiResponse<AiAnalizResponse>>('/ai/analiz/anomali');
      return response.data;
    },

    async tasarrufFirsatlari(): Promise<ApiResponse<AiAnalizResponse>> {
      const response = await client.get<ApiResponse<AiAnalizResponse>>('/ai/analiz/tasarruf');
      return response.data;
    },
  };
}

export function createAiSohbetService(client: AxiosInstance) {
  return {
    async getOturumlar(): Promise<ApiResponse<SohbetOturumResponse[]>> {
      const response = await client.get<ApiResponse<SohbetOturumResponse[]>>('/ai/sohbet/oturumlar');
      return response.data;
    },

    async yeniOturumBaslat(): Promise<ApiResponse<SohbetOturumResponse>> {
      const response = await client.post<ApiResponse<SohbetOturumResponse>>('/ai/sohbet/oturumlar');
      return response.data;
    },

    async getMesajlar(oturumId: number): Promise<ApiResponse<SohbetMesajiResponse[]>> {
      const response = await client.get<ApiResponse<SohbetMesajiResponse[]>>(`/ai/sohbet/oturumlar/${oturumId}/mesajlar`);
      return response.data;
    },

    async mesajGonder(oturumId: number, icerik: string): Promise<ApiResponse<SohbetMesajiResponse>> {
      const response = await client.post<ApiResponse<SohbetMesajiResponse>>(`/ai/sohbet/oturumlar/${oturumId}/mesajlar`, { icerik });
      return response.data;
    },

    async oturumKapat(oturumId: number): Promise<void> {
      await client.delete(`/ai/sohbet/oturumlar/${oturumId}`);
    },
  };
}

export type AiAnalizService = ReturnType<typeof createAiAnalizService>;
export type AiSohbetService = ReturnType<typeof createAiSohbetService>;
