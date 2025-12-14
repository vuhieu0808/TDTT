import api from "@/lib/axios";

export const friendServices = {
  async getMatchRequests() { // get friend requests list (sentRequests, receivedRequests)
    const response = await api.get("/friends/match-requests");
    return response.data;
  },
  async getMatches() { // get friends list (friends)
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
