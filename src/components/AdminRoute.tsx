// /admin 라우트를 보호하기 위한 컴포넌트

import { useAuth } from "@/contexts/useAuth";
import { Navigate, Outlet } from "react-router-dom";
import BaseLoading from "@/components/BaseLoading";

export default function AdminRoute() {
  const { isChecking, isAdmin } = useAuth();

  if (isChecking) {
    // 로그인 상태 확인 - 토큰 재발급 등
    return <BaseLoading />;
  }

  if (isAdmin) {
    // role == ADMIN
    return <Outlet />;
  }

  // role == USER
  return <Navigate replace to="/" />;
}
