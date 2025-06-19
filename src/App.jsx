import React, { Suspense, useEffect } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { routes, getDefaultRouteByRole } from "./config/routes";
import useAuthStore from "./stores/authStore";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import Layout from "./components/layout/Layout";

// Component to handle role-based protection
const PrivateRoute = ({ component: Component, roles, isPublic }) => {
  const { user, isLoading, initializeAuth, } = useAuthStore();

  useEffect(() => {
    initializeAuth?.();
  }, [initializeAuth]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isPublic) {
    return <Component />;
  }

  if (!user && !isLoading) {
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
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const defaultRoute = getDefaultRouteByRole(user?.role);
  return <Navigate to={defaultRoute} replace />;
};

function App() {
  const { user, initializeAuth, isLoading } = useAuthStore();

  // Initialize authentication on app start
  useEffect(() => {
    initializeAuth?.();
  }, [initializeAuth]);

  if (isLoading) {
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
