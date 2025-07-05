import React, { Suspense, useEffect, useLayoutEffect } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { routes, getDefaultRouteByRole } from "./config/routes";
import useAuthStore from "./stores/authStore";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import Layout from "./components/layout/Layout";
import socketService from "./services/socketService";

// Component to handle role-based protection
const PrivateRoute = ({ component: Component, roles, isPublic }) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isPublic) {
    return <Component />;
  }

  if (!user && !loading) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Wrap protected routes with Layout
  return (
    <Layout>
      <Component />
    </Layout>
  );
};

// Default route handler
const DefaultRoute = () => {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Only redirect if we're actually on the root path
  if (location.pathname === "/") {
    const defaultRoute = getDefaultRouteByRole(user?.role);
    return <Navigate to={defaultRoute} replace />;
  }

  // If we're not on root path, don't redirect
  return null;
};

function App() {
  const { user, initializeAuth, loading } = useAuthStore();

  // Initialize auth and socket connection
  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (user && user?.id) {
      socketService.connect(user.id);
    }

    return () => {
      socketService.disconnect();
    };
  }, [user, user?.id]);

  console.log(user, loading, "Auth state in App");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider userId={user?.id || ""}>
          <BrowserRouter>
            <Suspense
              fallback={
                <div className="flex justify-center items-center h-screen">
                  <LoadingSpinner size="lg" />
                </div>
              }
            >
              <Routes>
                {routes.map(({ path, component, roles, isPublic }) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <PrivateRoute
                        component={component}
                        roles={roles}
                        isPublic={isPublic}
                      />
                    }
                  />
                ))}
                <Route path="/" element={<DefaultRoute />} />
                <Route
                  path="*"
                  element={<Navigate to="/not-found" replace />}
                />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;