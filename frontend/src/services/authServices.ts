import api from "@/lib/axios";

export const authServices = {
  checkUserExistence: async (uid: string) => {
    try {
      const res = await api.get(`/auth/checkUserExistence/${uid}`);
      return res.data;
    } catch (error) {
      console.error("Error checking user existence:", error);
      throw error;
    }
  }
}