import { friendServices } from "@/services/friendServices";
import type { FriendState } from "@/types/store";
import type { Friend, UserProfile } from "@/types/user";
import { create } from "zustand";

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  loadingFriend: false,
  receivedFriendRequests: [],
  sentFriendRequests: [],
  loadingFriendRequest: false,

  fetchFriends: async () => {
    try {
      set({ loadingFriend: true });
      const response = await friendServices.getMatches();
      set({ friends: response.matches });
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      set({ loadingFriend: false });
    }
  },
  fetchFriendRequests: async () => {
    try {
      set({ loadingFriendRequest: true });
      const response = await friendServices.getMatchRequests();
      set({
        receivedFriendRequests: response.receivedRequests,
        sentFriendRequests: response.sentRequests,
      });
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    } finally {
      set({ loadingFriendRequest: false });
    }
  },
  swipeLeft: async (userId: string) => {
    try {
      const response = await friendServices.swipeLeft(userId);
      const { receivedFriendRequests, sentFriendRequests } = get();
      set({
        receivedFriendRequests: receivedFriendRequests.filter(
          (user) => user.uid !== userId
        ),
        sentFriendRequests: sentFriendRequests.filter(
          (user) => user.uid !== userId
        ),
      });
    } catch (error) {
      console.error("Error swiping left:", error);
    }
  },
  swipeRight: async (userId: string) => {
    try {
      const response = await friendServices.swipeRight(userId);
    } catch (error) {
      console.error("Error swiping right:", error);
    }
  },
  unMatch: async (userId: string) => {
    try {
      await friendServices.unmatch(userId);
      const { friends } = get();
      set({
        friends: friends.filter((user) => user.user.uid !== userId),
      });
    } catch (error) {
      console.error("Error unmatching friend:", error);
    }
  },
  addNewFriend: (friend: Friend) => {
    const { friends } = get();
    set({ friends: [friend, ...friends] });
    // xóa bạn khỏi danh sách yêu cầu kết bạn đã nhận và đã gửi
    const { receivedFriendRequests, sentFriendRequests } = get();
    console.log("Friend", friend);
    set({
      receivedFriendRequests: receivedFriendRequests.filter(
        (user) => user.uid !== friend.user.uid
      ),
      sentFriendRequests: sentFriendRequests.filter(
        (user) => user.uid !== friend.user.uid
      ),
    });
  },
  addNewReceivedRequest: (user: UserProfile) => {
    const { receivedFriendRequests } = get();
    set({ receivedFriendRequests: [user, ...receivedFriendRequests] });
  },
  addNewSentRequest: (user: UserProfile) => {
    const { sentFriendRequests } = get();
    set({ sentFriendRequests: [user, ...sentFriendRequests] });
  },
}));
