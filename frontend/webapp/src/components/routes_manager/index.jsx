import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../../pages/home";
import { CubeSpinner } from "../spinners";
import ProtectedRoutesContentManager from "../protected_routes_content_manager";

const LandingPage = React.lazy(() => import("../../pages/landing"));
const SignupPage = React.lazy(() => import("../../pages/signup"));
const InfoPage = React.lazy(() => import("../../pages/info"));
const SettingsPage = React.lazy(() => import("../../pages/settings"));
const ProfilePage = React.lazy(() => import("../../pages/profile"));
const DashboardPage = React.lazy(() => import("../../pages/dashboard"));
const SignInPage = React.lazy(() => import("../../pages/signin"));
const ModerationPage = React.lazy(() => import("../../pages/moderation"));

const RoutesManager = () => {
  return (
    <>
      <Routes>
        <Route
          /* path="/" */
          index
          element={
            <Suspense fallback={<CubeSpinner />}>
              <LandingPage />
            </Suspense>
          }
        />
        <Route
          path="/info"
          element={
            <Suspense fallback={<CubeSpinner />}>
              <InfoPage />
            </Suspense>
          }
        />
        <Route
          path="home"
          element={
            <ProtectedRoutesContentManager>
              <Suspense fallback={<CubeSpinner />}>
                <HomePage />
              </Suspense>
            </ProtectedRoutesContentManager>
          }
        />
        <Route
          path="moderation"
          element={
            <ProtectedRoutesContentManager>
              <Suspense fallback={<CubeSpinner />}>
                <ModerationPage />
              </Suspense>
            </ProtectedRoutesContentManager>
          }
        />
        <Route
          path="dashboard"
          element={
            <ProtectedRoutesContentManager>
              <Suspense fallback={<CubeSpinner />}>
                <DashboardPage />
              </Suspense>
            </ProtectedRoutesContentManager>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoutesContentManager>
              <Suspense fallback={<CubeSpinner />}>
                <SettingsPage />
              </Suspense>
            </ProtectedRoutesContentManager>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoutesContentManager>
              <Suspense fallback={<CubeSpinner />}>
                <ProfilePage />
              </Suspense>
            </ProtectedRoutesContentManager>
          }
        />
        <Route
          path="signin"
          element={
            <Suspense fallback={<CubeSpinner />}>
              <SignInPage />
            </Suspense>
          }
        />
        <Route
          path="signup"
          element={
            <Suspense fallback={<CubeSpinner />}>
              <SignupPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default RoutesManager;
