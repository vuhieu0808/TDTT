import type { User } from "firebase/auth";
export interface AuthState {
  user: User | null; // Người dùng hiện tại hoặc null nếu chưa đăng nhập
  token: string | null; // Token xác thực của người dùng
  loading: boolean; // Trạng thái tải

  signInWithGoogle: () => Promise<void>; // Hàm đăng nhập với Google
  logout: () => Promise<void>; // Hàm đăng xuất
  refresh: () => Promise<void>; // Hàm làm mới token
}
