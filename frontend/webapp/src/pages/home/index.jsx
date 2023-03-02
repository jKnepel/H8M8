import React, { useContext, useMemo, useState } from "react";
import {
  Center,
  Group,
  LoadingOverlay,
  Select,
  Space,
  Stack,
  Text,
} from "@mantine/core";
import ChatGroupOverview from "../../components/chatgroup_overview";
import { PageHeadingWithHelper } from "../../components/page_heading";
import StatisticContext from "../../components/statistic_context_provider";
import "./style.scss";

const HomePage = () => {
  const [selectedApp, setSelectedApp] = useState("all");
  const { overviewData, isLoadingOverviewData, filterOptionsSourceApps } = useContext(StatisticContext);

  const filteredData = useMemo(() => {
    if (overviewData) {
      return overviewData.filter(
        (e) => selectedApp === "all" || e.sourceAppId === selectedApp
      );
    } else {
      return [];
    }
  }, [overviewData, selectedApp]);

  return (
    <div className="wbs-home-page wsb-page-content">
      <PageHeadingWithHelper title="Home" storageId="home">
        <Text>
          This page gives you an overview over your chatgroups, containing the
          most vital info for each chatgroup throughout the last/current active
          session and all combined sessions. You can click on the button in each
          chatgroup to gain a more detailed insight into statistics about that
          chatgroup.
        </Text>
      </PageHeadingWithHelper>
      <Group position="apart" align="flex-end">
        <Select
          value={selectedApp}
          onChange={setSelectedApp}
          data={[{ value: "all", label: "All" }, ...filterOptionsSourceApps]}
          disabled={isLoadingOverviewData}
        />
        {overviewData && (
          <Text size="sm" color="gray">
            {filteredData.length === overviewData.length
              ? `showing ${overviewData.length} items`
              : `showing ${filteredData.length} of ${overviewData.length} items`}
          </Text>
        )}
      </Group>
      <Space h="xl" />
      <div>
        <LoadingOverlay visible={isLoadingOverviewData} overlayBlur={2} />
        {filteredData && filteredData?.length !== 0 ? (
          <Stack>
            {filteredData.map((chatgroup, i) => (
              <ChatGroupOverview key={i} data={chatgroup} />
            ))}
          </Stack>
        ) : (
          <Center style={{ height: 100 }}>
            <Text color="dimmed">
              {"It looks like you have no chatgroups assigned to your user."}
            </Text>
          </Center>
        )}
      </div>
    </div>
  );
};

export default HomePage;
