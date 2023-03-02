import { Image, Text, Title } from "@mantine/core";
import React from "react";
import { NavLink } from "react-router-dom";
import Logo from "../../assets/icons/favicon.png";
import { PageHeading } from "../../components/page_heading";
import CONSTANTS from "../../utils/constants";
import "./style.scss";

const InfoPage = () => {
  return (
    <div className="wbs-info-page wsb-page-content">
      <div className="wbs-info-page__content">
        <PageHeading title="Project Info" />
        <Title order={2}>Attribution</Title>
        <Title order={3}>Background Gradients</Title>
        <Text>
          Background Gradients were generated using{" "}
          <a href="heikei.com">Heikei</a>
        </Text>
        <Title order={3}>Logo and Favicon</Title>
        <Image width={120} radius="sm" src={Logo}></Image>
        <Text>
          Icon used from Flaticon:{" "}
          <a href="https://www.flaticon.com/de/kostenloses-icon/chat-bot_7533418#">
            https://www.flaticon.com/de/kostenloses-icon/chat-bot_7533418
          </a>
        </Text>
        <Title order={3}>Frameworks</Title>
        <Title order={4}>Design System, React Hooks etc.</Title>
        <Text>
          Mantine was used for various React-based tools. More info on{" "}
          <a href="https://mantine.dev/">mantine.dev</a>
        </Text>
        <Title order={1}>Datenschutz</Title>
        <Title order={1}>Impressum und Kontakt</Title>
        <Text>
          Frontend Teamlead: Oliver Tworkowski (s0568202@htw-berlin.de)
        </Text>
        <Text>Project Teamlead: Stefani ...</Text>
        <Title order={1}>Sitemap</Title>
        <ul>
          {CONSTANTS.SITEMAP.map((e, i) => (
            <li key={i}>
              <NavLink to={e.href}>{e.label}</NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InfoPage;
