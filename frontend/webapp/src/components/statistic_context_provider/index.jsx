import React, { useMemo, createContext, useCallback } from "react";
import "./style.scss";
import StatisticService from "../../api/statistic-service";
import { useQuery } from "react-query";

const StatisticContext = createContext();

const StatisticContextProvider = (props) => {
  const { data: overviewData, isLoading: isLoadingOverviewData } = useQuery(
    "OVERVIEW",
    StatisticService.fetchChatgroupOverview
  );

  const { data: classificationsData, isLoading: isLoadingClassificationsData } =
    useQuery("CLASSIFICATIONS", StatisticService.fetchClassificationCategories);

  const filterOptionsSourceApps = useMemo(() => {
    if (overviewData) {
      const sourceApps = overviewData.reduce((p, c) => {
        const id = c?.sourceAppId;
        const v = c?.sourceAppName;
        // don't add new option if value is null or value already exists as option
        if (!v || p.some((item) => item.value === id)) return p;
        return [...p, { value: id, label: v }];
      }, []);
      return sourceApps.sort((a, b) => a.label >= b.label);
    } else {
      return [];
    }
  }, [overviewData]);

  const filterOptionsChatGroups = useMemo(() => {
    if (overviewData) {
      const chatGroups = overviewData.reduce((p, c) => {
        const id = c?.chatGroupId;
        const v = `${c?.sourceAppName}/${c?.chatGroupName}`;
        // don't add new option if value is null or value already exists as option
        if (!v || p.some((item) => item.value === id)) return p;
        return [...p, { value: id, label: v }];
      }, []);
      return chatGroups.sort((a, b) => a.label >= b.label);
    } else {
      return [];
    }
  }, [overviewData]);

  const filterOptionsClassificationsData = useMemo(() => {
    if (classificationsData) {
      return classificationsData.reduce((p, c) => {
        const v = c?.classification;
        const id = c?.id;
        return [...p, { value: id, label: v }];
      }, []);
    } else {
      return [];
    }
  }, [classificationsData]);

  const getClassificationTextFromId = useCallback(
    (id) => {
      if (id === undefined || id === null || !classificationsData) return "";
      const v = classificationsData.find((x) => `${x?.id}` === `${id}`);
      return v && v?.classification ? v.classification : "";
    },
    [classificationsData]
  );

  return (
    <StatisticContext.Provider
      value={{
        overviewData,
        isLoadingOverviewData,
        filterOptionsSourceApps,
        filterOptionsChatGroups,
        classificationsData,
        isLoadingClassificationsData,
        filterOptionsClassificationsData,
        getClassificationTextFromId,
      }}
    >
      {props?.children}
    </StatisticContext.Provider>
  );
};

export default StatisticContext;
export { StatisticContextProvider };
