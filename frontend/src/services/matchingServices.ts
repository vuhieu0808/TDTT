import api from "@/lib/axios";
import type { MatchScore } from "@/types/match";

interface MatchResponse {
  matches: MatchScore[];
}

export const matchingServices = {
  async getMatches(limit: number = 10): Promise<MatchResponse> {
    const response = await api.get(`/matching/matches?limit=${limit}`);
    return response.data as MatchResponse;
  }
}