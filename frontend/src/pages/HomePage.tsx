import React from "react";
import { useAuthStore } from "../stores/useAuthStore";
import api from "@/lib/axios";

const HomePage = () => {
  // call Logout function
  const { logout } = useAuthStore();
  const onLogout = async () => {
    await logout();
  };

  const testAPI = async () => {
    try {
      const res = await api.get("/auth/test");
      console.log("API Response:", res.data);
    } catch (error) {
      console.error("Error testing API:", error);
    }
  };

  return (
    <div>
      <p>Welcome to the HomePage</p>
      <button className="mr-2" onClick={testAPI}>
        Test API
      </button>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
};

export default HomePage;
