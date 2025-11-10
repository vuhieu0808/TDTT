import { create } from "zustand";
import { auth, provider } from "../config/firebase";
import { onIdTokenChanged, signInWithPopup, signOut } from "firebase/auth";
import type { AuthState } from "../types/store";
import { toast } from "sonner";
import { authServices } from "@/services/authServices";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: true,

  signInWithGoogle: async () => {
    try {
      set({ loading: true });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken();
      set({ user: user, token: token, loading: false });
      toast.success("Đăng nhập thành công");
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast.error("Đăng nhập thất bại");
      set({ loading: false });
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      set({ loading: true });
      await signOut(auth);
      set({ user: null, token: null, loading: false });
    } catch (error) {
      console.error("Error signing out:", error);
      set({ loading: false });
    } finally {
      set({ loading: false });
    }
  },

  refresh: async () => {
    try {
      set({ loading: true });
      const user = get().user;
      if (user) {
        const token = await user.getIdToken(true);
        set({ token: token });
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      set({ loading: false });
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
      useAuthStore.setState({ user: user, token: token });
    } catch (error) {
      console.error("Error getting token:", error);
    } finally {
      useAuthStore.setState({ loading: false });
    }
  } else {
    useAuthStore.setState({ user: null, token: null, loading: false });
  }
});
