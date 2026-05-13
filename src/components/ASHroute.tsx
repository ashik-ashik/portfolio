import type { ReactNode } from "react";
import { Navigate } from "react-router";
import useAuth from "../hooks/useAuth";

type ASHrouteProps = {
  children: ReactNode;
};

const ASHroute = ({ children }: ASHrouteProps) => {
  const { currentUserInfo, userIsLoading } = useAuth();

  if (userIsLoading) {
    return <div>Loading...</div>;
  }

  if (currentUserInfo?.Role !== import.meta.env.VITE_ASH_ADMIN_SECRET_ROLE) {
    return <Navigate to="/*" replace />;
  }

  return children;
};

export default ASHroute;