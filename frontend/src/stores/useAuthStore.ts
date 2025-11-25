import { create } from "zustand";
import { persist } from "zustand/middleware";
import { auth, provider } from "../config/firebase";
import { onIdTokenChanged, signInWithPopup, signOut } from "firebase/auth";
import type { AuthState } from "../types/store";
import { toast } from "sonner";
import { authServices } from "@/services/authServices";
import { useChatStore } from "./useChatStore";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      userProfile: null,
      authUser: null,
      token: null,
      loading: true,

      clearState: () => {
        set({
          authUser: null,
          userProfile: null,
          token: null,
          loading: false,
        });
        localStorage.clear();
        useChatStore.getState().reset();
      },

      signInWithGoogle: async () => {
        try {
          set({ loading: true });
          localStorage.clear();
          useChatStore.getState().reset();

          const result = await signInWithPopup(auth, provider);
          const authUser = result.user;
          const token = await authUser.getIdToken();

          set({ authUser: authUser, token: token });
          await authServices.createUser();

          await get().fetchMe();
          await useChatStore.getState().fetchConversations();

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
          get().clearState();
          toast.success("Đăng xuất thành công");
        } catch (error) {
          console.error("Error signing out:", error);
        } finally {
          set({ loading: false });
        }
      },

      fetchMe: async () => {
        try {
					if (!get().authUser) {
						set({ userProfile: null });
            return;
          }
          if (get().userProfile) {
						return;
          }
					console.log("Fetching user profile for:", get().authUser);
					set({ loading: true });
          const { data } = await authServices.fetchMe();
          console.log("Fetched user profile:", data);
          set({ userProfile: data });
        } catch (error) {
          set({ userProfile: null });
          console.error("Error fetching user profile:", error);
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        authUser: state.authUser,
        userProfile: state.userProfile,
        token: state.token,
      }),
			onRehydrateStorage: () => (state) => {
        console.log('Hydration finished. Loaded authUser:', state?.authUser);
        console.log('Hydration finished. Loaded userProfile:', state?.userProfile);
        console.log('Hydration finished. Loaded token:', state?.token);
      },
    }
  )
);

onIdTokenChanged(auth, async (user) => {
  if (user) {
    console.log("onIdTokenChanged triggered with user:", user);
    try {
			const currentAuthUser = useAuthStore.getState().authUser;
			if (!currentAuthUser || currentAuthUser.uid !== user.uid) {
				useAuthStore.setState({ loading: true });
			}
      const token = await user.getIdToken();
      useAuthStore.setState({ authUser: user, token: token });
      await useAuthStore.getState().fetchMe();
    } catch (error) {
      console.error("Error getting token:", error);
    } finally {
      useAuthStore.setState({ loading: false });
    }
  } else {
    useAuthStore.setState({
      authUser: null,
      token: null,
      loading: false,
    });
  }
});
