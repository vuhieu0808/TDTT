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
  },
  createUser: async () => {
    try {
      const res = await api.post("/auth/createUser");
      return res.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },
  fetchMe: async () => {
    try {
      const res = await api.get("/users/me");
      return res.data;
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  },
};
