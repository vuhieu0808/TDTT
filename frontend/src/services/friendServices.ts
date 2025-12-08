import api from "@/lib/axios";

export const friendServices = {
  async getMatches() {
    const response = await api.get("/friends/requests");
    return response.data;
  },
  async swipeRight(receiverId: string) { // like
    const response = await api.post("/friends/swipe-right", { receiverId });
    return response.data;
  },
  async swipeLeft(receiverId: string) { // dislike
    const response = await api.post("/friends/swipe-left", { receiverId });
    return response.data;
  },
  async unmatch(targetUserId: string) {
    const response = await api.post(
      `/friends/requests/${targetUserId}/unmatch`
    );
    return response.data;
  },
};
