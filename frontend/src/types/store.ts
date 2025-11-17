import type { User as FirebaseAuthUser } from "firebase/auth";
import type { UserProfile } from "../types/user";

export interface AuthState {
  authUser: FirebaseAuthUser | null; // Người dùng hiện tại hoặc null nếu chưa đăng nhập
  userProfile: UserProfile | null; // Hồ sơ người dùng hoặc null nếu chưa có
  token: string | null; // Token xác thực của người dùng
  loading: boolean; // Trạng thái tải

  signInWithGoogle: () => Promise<void>; // Hàm đăng nhập với Google
  logout: () => Promise<void>; // Hàm đăng xuất

}
