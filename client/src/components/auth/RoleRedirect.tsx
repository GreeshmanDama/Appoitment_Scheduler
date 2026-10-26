
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";

export default function RoleRedirect() {
  const { userData } = useSelector(
    (state: RootState) => state.user
  );

  if (!userData) {
    return <Navigate to="/" replace />;
  }

  switch (userData.role) {
    case "admin":
      return <Navigate to="/admin/dashboard" replace />;

    case "doctor":
      return <Navigate to="/doctor/dashboard" replace />;

    case "patient":
      return <Navigate to="/patient/dashboard" replace />;

    default:
      return <Navigate to="/unauthorized" replace />;
  }
}
