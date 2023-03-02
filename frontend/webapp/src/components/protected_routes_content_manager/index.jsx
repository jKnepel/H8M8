import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import ProtectedRoutesNavigation from "../protected_routes_navigation";
import "./style.scss";
import { useSelector } from "react-redux";
import {
  selectIsHydrated,
  selectIsHydrating,
  selectIsSignedOut,
} from "../../redux/ducks/auth-duck/auth.duck.selectors";
import { hydrate } from "../../redux/ducks/auth-duck/auth-duck.thunks";
import { useAppDispatch } from "../../redux/store";
import FullscreenLoadingOverlay from "../fullscreen_loading_overlay";
import { StatisticContextProvider } from "../statistic_context_provider";

const ProtectedRoutesContentManager = (props) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isHydrating = useSelector(selectIsHydrating);
  const isSignedOut = useSelector(selectIsSignedOut);
  const isHydrated = useSelector(selectIsHydrated);

  useEffect(() => {
    if (isSignedOut)
      navigate("/signin?redirect=" + location.pathname + location.search);
    if (!isHydrated && !isHydrating) dispatch(hydrate());
  }, [
    dispatch,
    isHydrated,
    isHydrating,
    isSignedOut,
    location.pathname,
    location.search,
    navigate,
  ]);
  if (!isHydrated || isSignedOut) {
    return <FullscreenLoadingOverlay />;
  }

  return (
    <div className="wbs-public-page-content-manager">
      <ProtectedRoutesNavigation
        className="wbs-dashboard-page__sidebar "
        onSidebarExpandStateChange={(newState) => {
          setIsSidebarExpanded(newState);
        }}
      />
      <div
        className={`wbs-public-page-content-manager__main-content ${
          isSidebarExpanded
            ? "wbs-public-page-content-manager__main-content--expanded"
            : "wbs-public-page-content-manager__main-content--collapsed"
        }`}
      >
        <StatisticContextProvider>{props.children}</StatisticContextProvider>
      </div>
    </div>
  );
};

export default ProtectedRoutesContentManager;
