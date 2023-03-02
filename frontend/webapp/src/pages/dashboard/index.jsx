import React, { useContext, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation } from "react-query";
import {
  Center,
  Checkbox,
  Grid,
  Group,
  Image,
  LoadingOverlay,
  MultiSelect,
  Select,
  Space,
  Stack,
  Text,
} from "@mantine/core";
import { DateRangePicker } from "@mantine/dates";
import BarChart from "../../components/charts/bar_chart";
import AreaChart from "../../components/charts/area_chart";
import LineChart from "../../components/charts/line_chart";
import RadarChart from "../../components/charts/radar_chart";
import TableChart from "../../components/charts/table_chart";
import BarRatioChart from "../../components/charts/bar_ratio_chart";
import HatefulUsersChart from "../../components/charts/hateful_users_chart";
import { GRID_PROPS_LARGE, GRID_PROPS_MIDDLE } from "../../components/charts";
import StatisticContext from "../../components/statistic_context_provider";
import { PageHeadingWithHelper } from "../../components/page_heading";
import { formatGroupchatData } from "../../utils/statistics_helpers";
import StatisticService from "../../api/statistic-service";
import moment from "moment";
import "./style.scss";

const getDefaultDate = (urlParams) => {
  const startDate = moment(urlParams.get("startDate"), "YYYYMMDD").toDate();
  const endDate = moment(urlParams.get("endDate"), "YYYYMMDD").toDate();
  if (!isNaN(endDate)) endDate.setHours(23, 59, 59);

  return [
    isNaN(startDate) ? moment().subtract(7, "d").toDate() : startDate,
    isNaN(endDate) ? moment().toDate() : endDate
  ];
};

const DashboardPage = () => {
  const { isLoadingOverviewData, filterOptionsChatGroups } = useContext(StatisticContext);
  const [urlParams, setUrlParams] = useSearchParams();
  const [chatGroupIds, setChatgroupIds] = useState([]);
  const [dateRange, setDateRange] = useState(getDefaultDate(urlParams));

  const {
    data: statisticsData,
    isLoading: isLoadingStatisticsData,
    mutate,
  } = useMutation(
    "STATISTICS",
    async (requestBody) =>
      StatisticService.fetchDetailedStatistics(requestBody),
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  const getValidIds = useCallback((ids) => {
    const validIds = [];
    ids?.forEach((id) => {
      if (filterOptionsChatGroups.find((chatgroup) => chatgroup.value == id))
        validIds.push(parseInt(id));
    });
    return validIds;
  }, [filterOptionsChatGroups]);

  useEffect(() => {
    if (urlParams.get("ids") === null || isLoadingOverviewData) return;
    if (urlParams.get("ids") === "") {
      urlParams.delete("ids");
      setUrlParams(urlParams);
      return;
    }

    const validIds = getValidIds(urlParams.get("ids").split(","));
    if (validIds.length !== chatGroupIds.length) setChatgroupIds(validIds);
  }, [urlParams, setUrlParams, isLoadingOverviewData, getValidIds, chatGroupIds]);

  useEffect(() => {
    const validIds = getValidIds(chatGroupIds);
    if ((!validIds || validIds.length == 0) && !(
      validIds.length == 0 && 
      (statisticsData || statisticsData?.data.length > 0)
    )) return;
    if (!dateRange || dateRange.length != 2) return;
    if (!dateRange[0] || !dateRange[1]) return;

    const body = {
      isMerged: false,
      timeInterval: "day",
      timeStart: moment(dateRange[0]),
      timeEnd: moment(dateRange[1]),
      chatGroups: validIds,
    };

    mutate(body);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatGroupIds, dateRange, mutate, getValidIds]);

  const formattedData = useMemo(
    () => formatGroupchatData(statisticsData),
    [statisticsData]
  );

  const onChangeDateRange = (dateRange) => {
    const inclusiveDateRange = dateRange;
    if (inclusiveDateRange[1]) inclusiveDateRange[1].setHours(23, 59, 59);

    setDateRange(inclusiveDateRange);
    setUrlParams({
      ...Object.fromEntries(urlParams),
      ...(inclusiveDateRange[0] && { startDate: moment(inclusiveDateRange[0]).format("YYYYMMDD") }),
      ...(inclusiveDateRange[1] && { endDate: moment(inclusiveDateRange[1]).format("YYYYMMDD") })
    });
  };

  const onChangeChatgroupIds = (ids) => {
    setChatgroupIds(ids);
    setUrlParams({ ...Object.fromEntries(urlParams), ids: ids.join(",") });
  };

  return (
    <div className="wsb-page-content">
      <PageHeadingWithHelper title="Dashboard" storageId="dashboard">
        <Text>
          You have landed on the detailed statistics dashboard! You can select
          one or more chatgroups, for which you would like to gain an insight.
          The statistics here are date based, so you first need to pick a start
          and end date.
        </Text>
      </PageHeadingWithHelper>
      <Group style={{ zIndex: 401 }}>
        <DateRangePicker
          placeholder="Pick a date range for the statistics"
          maxDate={moment().toDate()}
          value={dateRange}
          onChange={onChangeDateRange}
        />
        <Select
          placeholder="Select Interval Value"
          value="days"
          data={[
            { value: "minutes", label: "Minutes", disabled: true },
            { value: "hours", label: "Hours", disabled: true },
            { value: "days", label: "Days" },
            { value: "weeks", label: "Weeks", disabled: true },
            { value: "months", label: "Months", disabled: true },
          ]}
        />
        <MultiSelect
          placeholder="Select Chat Group"
          value={chatGroupIds}
          data={filterOptionsChatGroups}
          onChange={onChangeChatgroupIds}
          disabled={isLoadingOverviewData}
          maxSelectedValues={3}
        />
        <Checkbox
          disabled
          label="IsMerged"
          color="cyan"
          size="xl"
          style={{ display: "flex", alignContent: "center" }}
          checked={false}
          readOnly
        />
      </Group>
      <Space h="xl" />
      <div>
        <LoadingOverlay visible={isLoadingStatisticsData} overlayBlur={1} />
        {!formattedData && (
          <Center style={{ minHeight: 400 }}>
            {!isLoadingStatisticsData && (
              <Stack mt="xl" spacing="mg">
                <div>
                  <Image
                    fit="contain"
                    src={
                      "https://cdn.pixabay.com/photo/2019/02/04/08/38/pixel-cells-3974183_960_720.png"
                    }
                    height={250}
                  />
                </div>
                <Text
                  fz="xl"
                  variant="gradient"
                  gradient={{ from: "indigo", to: "cyan", deg: 45 }}
                  ta="center"
                  fw={700}
                >
                  No statistics loaded yet, please update your filters!
                </Text>
              </Stack>
            )}
          </Center>
        )}
        {formattedData && (
          <Grid>
            <TableChart
              title="Chat Summary"
              data={formattedData.chatSummary}
            />
            <HatefulUsersChart
              data={formattedData.hatefulUsers}
            />
            <RadarChart
              title="Hate Speech Categories"
              size={GRID_PROPS_MIDDLE}
              data={{
                sources: formattedData.sources,
                data: formattedData.hatespeechPerCategory,
              }}
            />
            <BarChart
              title="Total Comments"
              size={GRID_PROPS_MIDDLE}
              unit=" comments"
              seperateGroups
              data={{
                sources: formattedData.sourcesComments,
                data: formattedData.commentsOverInterval,
              }}
            />
            <BarChart
              title="Total Hateful Comments"
              size={GRID_PROPS_MIDDLE}
              unit=" comments"
              seperateGroups
              data={{
                sources: formattedData.sourcesHatefulComments,
                data: formattedData.hatespeechCommentsOverInterval,
              }}
            />
            <BarRatioChart
              title="Hate Speech Ratio"
              size={GRID_PROPS_LARGE}
              seperateGroups
              data={{
                sources: formattedData.sources,
                ratios: formattedData.ratiosHatespeech,
                data: formattedData.hatespeechRatioOverInterval,
              }}
            />
            <AreaChart
              title="Total Active Users"
              size={GRID_PROPS_LARGE}
              unit=" users"
              seperateGroups
              data={{
                sources: formattedData.sourcesUsers,
                data: formattedData.usersOverInterval,
              }}
            />
            <LineChart
              title="Total Automatically flagged Comments"
              size={GRID_PROPS_MIDDLE}
              unit=" comments"
              seperateGroups
              data={{
                sources: formattedData.sourcesAutoFlagged,
                data: formattedData.autoFlaggedCommentsOverInterval,
              }}
            />
            <LineChart
              title="Total Manually flagged Comments"
              size={GRID_PROPS_MIDDLE}
              unit=" comments"
              seperateGroups
              data={{
                sources: formattedData.sourcesManuFlagged,
                data: formattedData.manuFlaggedCommentsOverInterval,
              }}
            />
            <BarRatioChart
              title="Flagged Comments Ratio"
              size={GRID_PROPS_MIDDLE}
              seperateGroups
              data={{
                sources: formattedData.sources,
                ratios: formattedData.ratiosFlaggedComments,
                data: formattedData.flaggedCommentsRatioOverInterval,
              }}
            />
            <LineChart
              title="Total Unflagged Comments"
              size={GRID_PROPS_MIDDLE}
              unit=" comments"
              seperateGroups
              data={{
                sources: formattedData.sourcesUnflagged,
                data: formattedData.unflaggedCommentsOverInterval,
              }}
            />
            <BarRatioChart
              title="Hate Speech Categories over Interval"
              size={GRID_PROPS_LARGE}
              seperateGroups
              data={{
                sources: formattedData.sources,
                ratios: formattedData.ratioHatespeechPerCategory,
                data: formattedData.hatespeechPerCategoryOverInterval,
              }}
            />
          </Grid>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
