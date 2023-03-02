import {
  ChatgroupStatistics,
  HatefulUsersData,
  Interval,
  IntervalDictionary,
  Radar,
  RadarDictionary,
  Ratio,
  Source,
  TableChartData
} from "./interfaces";
import { getFormattedDateTime } from "./helpers";
import { Color } from "./types";
import moment from "moment";

export interface FormattedGroupchatData {
  sources: Source[],
  sourcesUsers: Source[],
  sourcesComments: Source[],
  sourcesHatefulComments: Source[],
  sourcesAutoFlagged: Source[],
  sourcesManuFlagged: Source[],
  sourcesUnflagged: Source[],

  ratiosHatespeech: Ratio[],
  ratiosFlaggedComments: Ratio[],
  ratioHatespeechPerCategory: Ratio[],

  hatefulUsers: HatefulUsersData,
  chatSummary: TableChartData,
  hatespeechPerCategory: RadarDictionary | Radar[],

  usersOverInterval: IntervalDictionary | Interval[],
  commentsOverInterval: IntervalDictionary | Interval[],
  hatespeechCommentsOverInterval: IntervalDictionary | Interval[],
  hatespeechRatioOverInterval: IntervalDictionary | Interval[],
  autoFlaggedCommentsOverInterval: IntervalDictionary | Interval[],
  manuFlaggedCommentsOverInterval: IntervalDictionary | Interval[],
  flaggedCommentsRatioOverInterval: IntervalDictionary | Interval[],
  unflaggedCommentsOverInterval: IntervalDictionary | Interval[],
  hatespeechPerCategoryOverInterval: IntervalDictionary | Interval[]
}

export const formatGroupchatData = (data: ChatgroupStatistics | undefined) => {
  if (!data || data?.data.length == 0) return null;

  const formattedData: FormattedGroupchatData = {
    sources: new Array<Source>(),
    sourcesUsers: new Array<Source>(),
    sourcesComments: new Array<Source>(),
    sourcesHatefulComments: new Array<Source>(),
    sourcesAutoFlagged: new Array<Source>(),
    sourcesManuFlagged: new Array<Source>(),
    sourcesUnflagged: new Array<Source>(),

    ratiosHatespeech: new Array<Ratio>(),
    ratiosFlaggedComments: new Array<Ratio>(),
    ratioHatespeechPerCategory: new Array<Ratio>(),

    hatefulUsers: {},
    chatSummary: {},
    hatespeechPerCategory: {},

    usersOverInterval: generateCompleteIntervals(data.timeStart, data.timeEnd),
    commentsOverInterval: generateCompleteIntervals(data.timeStart, data.timeEnd),
    hatespeechCommentsOverInterval: generateCompleteIntervals(data.timeStart, data.timeEnd),
    hatespeechRatioOverInterval: generateCompleteIntervals(data.timeStart, data.timeEnd),
    autoFlaggedCommentsOverInterval: generateCompleteIntervals(data.timeStart, data.timeEnd),
    manuFlaggedCommentsOverInterval: generateCompleteIntervals(data.timeStart, data.timeEnd),
    flaggedCommentsRatioOverInterval: generateCompleteIntervals(data.timeStart, data.timeEnd),
    unflaggedCommentsOverInterval: generateCompleteIntervals(data.timeStart, data.timeEnd),
    hatespeechPerCategoryOverInterval: generateCompleteIntervals(data.timeStart, data.timeEnd)
  };

  formattedData.ratiosHatespeech.push(
    { name: "No Hate speech", color: "#12b886" },
    { name: "Hate speech", color: "#fa5252" }
  );

  formattedData.ratiosFlaggedComments.push(
    { name: "Manually Flagged Comments", color: "#569AFF" },
    { name: "Auto Flagged Comments", color: "#9BC64B" }
  );

  // iterate over groups and format data into a chart-consumable format
  data.data.forEach((chatgroup, index) => {
    const groupId = chatgroup.chatGroupId;
    const groupName = chatgroup.chatGroupName;
    const color = chartColors[index] ?? generateColor();

    formattedData.sources.push({
      id: groupId,
      name: groupName,
      color: color
    });

    formattedData.sourcesUsers.push({
      id: groupId,
      name: groupName,
      color: color,
      min: chatgroup.totalUsers.min,
      max: chatgroup.totalUsers.max,
      average: chatgroup.totalUsers.average
    });

    formattedData.sourcesComments.push({
      id: groupId,
      name: groupName,
      color: color,
      min: chatgroup.totalComments.min,
      max: chatgroup.totalComments.max,
      average: chatgroup.totalComments.average
    });

    formattedData.sourcesHatefulComments.push({
      id: groupId,
      name: groupName,
      color: color,
      min: chatgroup.totalHatespeechComments.min,
      max: chatgroup.totalHatespeechComments.max,
      average: chatgroup.totalHatespeechComments.average
    });

    formattedData.sourcesAutoFlagged.push({
      id: groupId,
      name: groupName,
      color: color,
      min: chatgroup.totalAutomaticallyFlaggedComments.min,
      max: chatgroup.totalAutomaticallyFlaggedComments.max,
      average: chatgroup.totalAutomaticallyFlaggedComments.average
    });

    formattedData.sourcesManuFlagged.push({
      id: groupId,
      name: groupName,
      color: color,
      min: chatgroup.totalManuallyFlaggedComments.min,
      max: chatgroup.totalManuallyFlaggedComments.max,
      average: chatgroup.totalManuallyFlaggedComments.average
    });

    formattedData.sourcesUnflagged.push({
      id: groupId,
      name: groupName,
      color: color,
      min: chatgroup.totalManuallyUnflaggedComments.min,
      max: chatgroup.totalManuallyUnflaggedComments.max,
      average: chatgroup.totalManuallyUnflaggedComments.average
    });

    // chat summary
    if (formattedData.chatSummary["All"] === undefined) formattedData.chatSummary["All"] = {};
    const noHatespeech = (chatgroup.totalComments.sum ?? 0) - (chatgroup.totalHatespeechComments.sum ?? 0);
    formattedData.chatSummary["All"]["Total Messages"] = addOrInitializeValue(
      formattedData.chatSummary["All"]["Total Messages"],
      chatgroup.totalComments.sum
    );
    formattedData.chatSummary["All"]["No Hate Speech"] = addOrInitializeValue(
      formattedData.chatSummary["All"]["No Hate Speech"],
      noHatespeech
    );
    formattedData.chatSummary["All"]["Hate Speech (auto)"] = addOrInitializeValue(
      formattedData.chatSummary["All"]["Hate Speech (auto)"],
      chatgroup.totalAutomaticallyFlaggedComments.sum
    );
    formattedData.chatSummary["All"]["Hate Speech (manual)"] = addOrInitializeValue(
      formattedData.chatSummary["All"]["Hate Speech (manual)"],
      chatgroup.totalManuallyFlaggedComments.sum
    );
    formattedData.chatSummary["All"]["Total Users"] = addOrInitializeValue(
      formattedData.chatSummary["All"]["Total Users"],
      chatgroup.totalUsers.sum
    );
    formattedData.chatSummary["All"]["Total Hateful Users"] = addOrInitializeValue(
      formattedData.chatSummary["All"]["Total Hateful Users"],
      chatgroup.totalHatefulUsers.sum
    );

    formattedData.chatSummary[groupName] = {
      ["Total Messages"]: chatgroup.totalComments.sum ?? 0,
      ["No Hate Speech"]: noHatespeech,
      ["Hate Speech (auto)"]: chatgroup.totalAutomaticallyFlaggedComments.sum ?? 0,
      ["Hate Speech (manual)"]: chatgroup.totalManuallyFlaggedComments.sum ?? 0,
      ["Total Users"]: chatgroup.totalUsers.sum ?? 0,
      ["Total Hateful Users"]: chatgroup.totalHatefulUsers.sum ?? 0
    };

    // top hateful users per group per category
    formattedData.hatefulUsers[groupName] = [{
      categoryName: "general",
      users: chatgroup.mostHatefulUsers.general.slice(0, 5)
    }].concat(chatgroup.mostHatefulUsers.categories.slice(0, 5));

    // sum of hateful comments per category
    chatgroup.totalHatespeechCommentsPerCategory.forEach((category) => {
      formattedData.hatespeechPerCategory[category.categoryName] = {
        ...formattedData.hatespeechPerCategory[category.categoryName],
        [groupName]: category.totalSum,
        subject: category.categoryName,
      };
    });

    // iterate over the groups' interval data and combine it into a usable dataset
    chatgroup.intervalData.forEach((interval) => {
      const date = getFormattedDateTime(interval.intervalDate);

      // sum of users over each interval
      formattedData.usersOverInterval[date] = {
        ...formattedData.usersOverInterval[date],
        [groupName]: interval.totalUsersSum
      };

      // sum of comments over each interval
      formattedData.commentsOverInterval[date] = {
        ...formattedData.commentsOverInterval[date],
        [groupName]: interval.totalCommentsSum
      };

      // sum of hateful comments over each interval
      formattedData.hatespeechCommentsOverInterval[date] = {
        ...formattedData.hatespeechCommentsOverInterval[date],
        [groupName]: interval.totalHatespeechCommentsSum
      };

      // hate speech ratio over each interval
      formattedData.hatespeechRatioOverInterval[date] = {
        ...formattedData.hatespeechRatioOverInterval[date],
        [`Hate speech!#${groupId}`]: interval.totalHatespeechCommentsSum,
        [`No Hate speech!#${groupId}`]: (interval.totalCommentsSum ?? 0) - (interval.totalHatespeechCommentsSum ?? 0)
      };

      // sum of automatically flagged comments over each interval
      formattedData.autoFlaggedCommentsOverInterval[date] = {
        ...formattedData.autoFlaggedCommentsOverInterval[date],
        [groupName]: interval.totalAutomaticallyFlaggedCommentsSum
      };

      // sum of manually flagged comments over each interval
      formattedData.manuFlaggedCommentsOverInterval[date] = {
        ...formattedData.manuFlaggedCommentsOverInterval[date],
        [groupName]: interval.totalManuallyFlaggedCommentsSum
      };

      // flagged comments ratio over each interval
      formattedData.flaggedCommentsRatioOverInterval[date] = {
        ...formattedData.flaggedCommentsRatioOverInterval[date],
        [`Manually Flagged Comments!#${groupId}`]: interval.totalManuallyFlaggedCommentsSum,
        [`Auto Flagged Comments!#${groupId}`]: interval.totalAutomaticallyFlaggedCommentsSum
      };

      // sum of unflagged comments over each interval
      formattedData.unflaggedCommentsOverInterval[date] = {
        ...formattedData.unflaggedCommentsOverInterval[date],
        [groupName]: interval.totalManuallyUnflaggedCommentsSum
      };

      // hatespeech comments divided up into each category over interval
      interval.totalHatespeechComments.forEach((category, index) => {
        const categoryName = category.categoryName;
        if (!formattedData.ratioHatespeechPerCategory[categoryName]) {
          formattedData.ratioHatespeechPerCategory[categoryName] = {
            name: categoryName,
            color: chartColors[index] ?? generateColor()
          };
        }

        formattedData.hatespeechPerCategoryOverInterval[date] = {
          ...formattedData.hatespeechPerCategoryOverInterval[date],
          [`${categoryName}!#${groupId}`]: category.totalSum
        };
      });

    });
  });

  // turn dictionaries into object arrays as required by the charts
  formattedData.ratioHatespeechPerCategory = Object.values(formattedData.ratioHatespeechPerCategory);
  formattedData.hatespeechPerCategory = Object.values(formattedData.hatespeechPerCategory);
  formattedData.usersOverInterval = Object.values(formattedData.usersOverInterval);
  formattedData.commentsOverInterval = Object.values(formattedData.commentsOverInterval);
  formattedData.hatespeechCommentsOverInterval = Object.values(formattedData.hatespeechCommentsOverInterval);
  formattedData.hatespeechRatioOverInterval = Object.values(formattedData.hatespeechRatioOverInterval);
  formattedData.autoFlaggedCommentsOverInterval = Object.values(formattedData.autoFlaggedCommentsOverInterval);
  formattedData.manuFlaggedCommentsOverInterval = Object.values(formattedData.manuFlaggedCommentsOverInterval);
  formattedData.flaggedCommentsRatioOverInterval = Object.values(formattedData.flaggedCommentsRatioOverInterval);
  formattedData.unflaggedCommentsOverInterval = Object.values(formattedData.unflaggedCommentsOverInterval);
  formattedData.hatespeechPerCategoryOverInterval = Object.values(formattedData.hatespeechPerCategoryOverInterval);
  return formattedData;
};

const generateCompleteIntervals = (timeStart: Date, timeEnd: Date): IntervalDictionary => {
  const startDate = moment(timeStart);
  const endDate = moment(timeEnd);
  const diff = endDate.diff(startDate, "day");

  const intervalObj = {};
  for (let i = 0; i <= diff; i++) {
    const formattedDate = getFormattedDateTime(startDate);
    intervalObj[formattedDate] = { date: formattedDate };
    startDate.add(1, "day");
  }

  return intervalObj;
};

const generateColor = (): Color => {
  return "#" + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, "0") as Color;
};

const addOrInitializeValue = (value: number | undefined, addend: number | null) => {
  return value === undefined ? addend ?? 0 : value + (addend ?? 0);
};

const chartColors: Color[] = [
  "#275587",
  "#3670C7",
  "#63ADF2",

  "#35443B",
  "#316354",
  "#4DAD89",

  "#755C1B",
  "#BE8029",
  "#D3B950"
];

export const getGroups = (sources: Source[]) => {
  return [{ value: "all", label: "All" }]
    .concat(
      sources.map(source => {
        return {
          value: "" + source.id,
          label: source.name
        };
      })
    );
};

export const getVisibleGroups = (
  seperateGroups: boolean,
  selectedChatgroup: string,
  sources: Source[]
) => {
  return seperateGroups && selectedChatgroup != "all"
    ? sources.filter((source) => source.id == selectedChatgroup)
    : sources;
};