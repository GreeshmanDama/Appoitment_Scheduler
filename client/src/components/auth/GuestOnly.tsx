import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";

export default function GuestOnly() {
  const { userData } = useSelector(
    (state: RootState) => state.user
  );

  if (userData) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}