import { matchingServices } from "@/services/matchingServices";
import type { MatchingState } from "@/types/store";
import { create } from "zustand";

export const useMatchStore = create<MatchingState>((set, get) => ({
  matches: [],
  loadingMatches: false,

  fetchMatches: async (limit = 10) => {
    try {
      set({ loadingMatches: true });
      const response = await matchingServices.getMatches(limit);
      set({ matches: response.matches });
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      set({ loadingMatches: false });
    }
  },
}));
