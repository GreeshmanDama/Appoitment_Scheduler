
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import type { UserRole } from "../../types/auth";

interface RequireAuthProps {
  allowedRoles?: UserRole[];
}

export default function RequireAuth({
  allowedRoles,
}: RequireAuthProps) {
  const { userData } = useSelector(
    (state: RootState) => state.user
  );

  const location = useLocation();

  if (!userData) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(userData.role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
