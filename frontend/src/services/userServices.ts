import api from "@/lib/axios";
import type { UserProfile } from "@/types/user";

export const userServices = {
	async updateMe(rawData: UserProfile) {
		const data = {
			...rawData,
			// Loại bỏ các trường không cần thiết hoặc không được phép cập nhật
			uid: undefined,
			email: undefined,
			createdAt: undefined,
			lastActivity: undefined,
			updatedAt: undefined,
		};
		console.log("Updating user with data:", data);
		const res = await api.put("/users/me", data);
		return res.data;
	},
	async fetchUserById(userId: string) {
		const response = await api.get(`/users/${userId}`);
		return response.data;
	}
};
