import { useLocalStorage } from "@mantine/hooks";
import React, { useCallback, useState } from "react";
import { useEffect } from "react";
import {
  Home2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  Logout,
  UserCircle,
  Settings,
  BrandPagekit,
  Dashboard as DashboardIcon,
  MessageReport,
} from "tabler-icons-react";
import { Avatar, Group, Text, UnstyledButton } from "@mantine/core";
import "./style.scss";
import { useLocation, useNavigate } from "react-router";
import IdenticonAvatar from "../identicon_avatar";
import { useSelector } from "react-redux";
import { selectUsername } from "../../redux/ducks/auth-duck/auth.duck.selectors";
import { useAppDispatch } from "../../redux/store";

const navigationHierarchy = {
  sections: [
    {
      name: "menu",
      displayName: "Menu",
      subSections: [
        {
          name: "home",
          displayName: "Home",
          path: "/home",
          icon: <Home2 />,
        },
        {
          name: "dashboard",
          displayName: "Dashboard",
          path: "/dashboard",
          icon: <DashboardIcon />,
        },
        {
          name: "moderation",
          displayName: "Moderation",
          path: "/moderation",
          icon: <MessageReport />,
        },
      ],
    },
    {
      name: "user",
      displayName: "User",
      subSections: [
        {
          name: "profile",
          displayName: "Profile",
          path: "/profile",
          icon: <UserCircle />,
        },
        {
          name: "settings",
          displayName: "Settings",
          path: "/settings",
          icon: <Settings />,
        },
      ],
    },
  ],
};

const ProtectedRoutesNavigation = (props) => {
  const { onSidebarExpandStateChange } = props;
  const [selectedTab, setSelectedTab] = useState();
  const username = useSelector(selectUsername);
  const dispatch = useAppDispatch();
  const signOut = useCallback(() => {
    dispatch({ type: "AUTH/SIGN_OUT" });
  }, [dispatch]);
  const [isExpanded, setIsExpanded] = useLocalStorage({
    key: "is_sidebar_expanded",
    defaultValue: false,
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    onSidebarExpandStateChange?.(isExpanded);
  }, [isExpanded, onSidebarExpandStateChange]);

  /*   useEffect(() => {
    const selectedSection = navigationHierarchy.sections[0];
    const selectedSubSection = selectedSection?.subSections[0];
    if (!selectedSubSection) return;
    setSelectedTab({
      key: `${selectedSection.name}-${selectedSubSection.name}`,
      text: `${selectedSection.displayName} / ${selectedSubSection.displayName}`,
    });
  }, []); */

  return (
    <div
      className={`wbs-dashboard-sidebar ${
        isExpanded
          ? "wbs-dashboard-sidebar--expanded"
          : "wbs-dashboard-sidebar--collapsed"
      }`}
    >
      <div
        onClick={() => {
          setIsExpanded(!isExpanded);
        }}
        className="wbs-dashboard-sidebar-expander"
      >
        <span className="wbs-dashboard-sidebar-expander__desktop">
          {isExpanded ? <ChevronLeft /> : <ChevronRight />}
        </span>
        <span className="wbs-dashboard-sidebar-expander__mobile">
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </span>
      </div>
      {selectedTab && (
        <Text
          size="md"
          color={"violet.4"}
          weight={400}
          className="wbs-dashboard-sidebar-mobile-title"
        >
          {selectedTab.text}
        </Text>
      )}
      <div className="wbs-dashboard-sidebar__content">
        <div className="wbs-dashboard-sidebar__content__scrollable">
          <div>
            <UnstyledButton
              component="a"
              href="/profile"
              className="wbs-dashboard-sidebar-profile"
            >
              <Group spacing="md">
                <IdenticonAvatar id={username} radius="sm" size="lg" />
                <div>
                  <Text size="lg" weight="600" style={{ lineHeight: 1 }}>
                    {username}
                  </Text>
                </div>
              </Group>
            </UnstyledButton>
            <div className="wbs-dashboard-sidebar-navigation">
              {navigationHierarchy.sections.map((section, i) => (
                <React.Fragment key={i}>
                  <Text className="wbs-dashboard-sidebar-navigation__section-item">
                    {section.displayName}
                  </Text>
                  <div className="wbs-dashboard-sidebar-navigation__subsection-container">
                    {section.subSections.map((subSection) => {
                      const key = `${section.name}-${subSection.name}`;
                      const isItemSelected = location.pathname.includes(
                        subSection.path
                      );
                      return (
                        <UnstyledButton
                          className={`wbs-dashboard-sidebar-navigation__subsection-item ${
                            isItemSelected
                              ? "wbs-dashboard-sidebar-navigation__subsection-item--selected"
                              : ""
                          }`}
                          key={key}
                          onClick={() => {
                            setSelectedTab({
                              key,
                              text: `${section.displayName} / ${subSection.displayName}`,
                            });
                            if (subSection?.path) navigate(subSection.path);
                          }}
                        >
                          <div>
                            {subSection?.icon ? (
                              subSection.icon
                            ) : (
                              <BrandPagekit />
                            )}
                            <Text>{subSection.displayName}</Text>
                          </div>
                        </UnstyledButton>
                      );
                    })}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <div className="wbs-dashboard-sidebar__content__non-scrollable">
          <UnstyledButton
            className={"wbs-dashboard-sidebar-navigation__subsection-item"}
            onClick={signOut}
          >
            <div>
              <Logout />
              <Text>Sign Out</Text>
            </div>
          </UnstyledButton>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoutesNavigation;
