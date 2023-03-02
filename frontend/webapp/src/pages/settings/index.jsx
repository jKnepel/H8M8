import { Divider, Group, Image, Title } from "@mantine/core";
import React from "react";
import { PageHeading } from "../../components/page_heading";
import settingsPrank from "../../assets/images/settings-prank.png";
import "./style.scss";

const SettingsPage = () => {
  return (
    <div className="wbs-profile-page wsb-page-content">
      <PageHeading title="Settings" />
      <Group>
        <div>
          <Image src={settingsPrank} height={400} fit="contain" />
        </div>
      </Group>
    </div>
  );
};

export default SettingsPage;
