import { create } from "zustand";
import { auth, provider } from "../config/firebase";
import { onIdTokenChanged, signInWithPopup, signOut } from "firebase/auth";
import type { AuthState } from "../types/store";
import { toast } from "sonner";
import { authServices } from "@/services/authServices";

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  userProfile: null,
  token: null,
  loading: true,

  signInWithGoogle: async () => {
    try {
      set({ loading: true });
      const result = await signInWithPopup(auth, provider);
      const authUser = result.user;
      const token = await authUser.getIdToken();
      set({ authUser: authUser, token: token });
      await authServices.createUser();
      toast.success("Đăng nhập thành công");
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast.error("Đăng nhập thất bại");
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      set({ loading: true });
      await signOut(auth);
      set({ authUser: null, userProfile: null, token: null, loading: false });
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      set({ loading: false });
    }
  },
}));

onIdTokenChanged(auth, async (user) => {
  if (user) {
    console.log("onIdTokenChanged triggered with user:", user);
    try {
      useAuthStore.setState({ loading: true });
      const token = await user.getIdToken();
      useAuthStore.setState({ authUser: user, token: token });
    } catch (error) {
      console.error("Error getting token:", error);
    } finally {
      useAuthStore.setState({ loading: false });
    }
  } else {
    useAuthStore.setState({ authUser: null, token: null, loading: false });
  }
});
