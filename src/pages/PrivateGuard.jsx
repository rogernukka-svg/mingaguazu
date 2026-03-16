import { Navigate } from "react-router-dom";

export default function PrivateGuard({ children, allowedRoles = [] }) {
  const raw = localStorage.getItem("jaha_private_user");
  const user = raw ? JSON.parse(raw) : null;

  if (!user) {
    return <Navigate to="/central-login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/central-login" replace />;
  }

  return children;
}