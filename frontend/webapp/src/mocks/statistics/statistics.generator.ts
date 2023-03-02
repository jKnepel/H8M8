import CONSTANTS from "../../utils/constants";
import {
  ChatgroupOverview,
  ChatgroupStatistic,
  ChatgroupStatistics,
  HatefulUserRank,
  ReportedComment,
  StatisticalInterval,
  StatisticalValue
} from "../../utils/interfaces";

const botCount = 3;
const entryCount = 5;
const startDate = new Date("2022-10-01");

export const generateChatGroupOverviewStatistics = (): ChatgroupOverview[] => {
  return [...Array(botCount)].map(() => generateOverviewStatistic());
};

export const generateOverviewStatistic = (): ChatgroupOverview => {
  const isDiscord = Math.floor(Math.random() * 2) === 0;

  return {
    chatGroupId: generateString("chatGroupId"),
    chatGroupName: generateString("chatGroup"),
    serverName: isDiscord ? generateString("serverName") : null,
    sourceAppId: isDiscord ? "discord" : "telegram",
    sourceAppName: isDiscord ? "discord" : "telegram",
    sessionInfo: {
      isOnline: generateBoolean(),
      sessionStart: new Date(),
      sessionEnd: new Date()
    },
    latestSession: {
      totalCommentsSum: generateInt(200, 50),
      totalHatefulCommentsSum: generateInt(50, 0)
    },
    allSessions: {
      totalCommentsSum: generateInt(200, 50),
      totalHatefulCommentsSum: generateInt(50, 0)
    }
  };
};

export const generateChatGroupStatistics = (startDate: Date, endDate: Date, timeInterval: string): ChatgroupStatistics => {
  const categories = [...Array(9)].map(() => generateString("category"));

  return {
    isMerged: false,
    timeInterval: timeInterval,
    timeStart: new Date(2022, 0, 1),
    timeEnd: new Date(2022, 0, 14),
    data: [...Array(botCount)].map((value, index) => generateStatistics(index, entryCount, categories))
  };
};

const generateStatistics = (index: number, entryCount: number, categories: string[]): ChatgroupStatistic => {
  return {
    chatGroupId: generateString("chatGroupId"),
    chatGroupName: generateString("chatGroup"),
    intervalData: [...Array(entryCount)].map((value, index) => generateIntervalData(index, categories)),
    mostHatefulUsers: {
      categories: categories.map((category) => ({
        categoryName: category,
        users: generateHatefulUserRanks()
      })),
      general: generateHatefulUserRanks()
    },
    serverName: generateString("serverName"),
    sessionInfo: [...Array(entryCount)].map(() => ({
      isCurrentSession: generateBoolean(),
      sessionEnd: new Date(),
      sessionStart: new Date()
    })),
    sourceAppId: generateString("sourceAppId"),
    sourceAppName: "discord",
    totalAutomaticallyFlaggedComments: generateStatisticalValue(),
    totalComments: generateStatisticalValue(),
    totalHatefulUsers: generateStatisticalValue(),
    totalHatespeechComments: generateStatisticalValue(),
    totalHatespeechCommentsPerCategory: categories.map((category) => ({
      categoryName: category,
      totalSum: generateInt(1, 10)
    })),
    totalManuallyFlaggedComments: generateStatisticalValue(),
    totalManuallyUnflaggedComments: generateStatisticalValue(),
    totalUsers: generateStatisticalValue()
  };
};

const generateIntervalData = (index, categories: string[]): StatisticalInterval => {
  return {
    intervalDate: addDays(startDate, index),
    totalAutomaticallyFlaggedCommentsSum: generateInt(50, 100),
    totalCommentsSum: generateInt(50, 100),
    totalHatespeechComments: categories.map((category) => ({
      categoryName: category,
      totalSum: generateInt(1, 10)
    })),
    totalHatespeechCommentsSum: generateInt(0, 50),
    totalManuallyFlaggedCommentsSum: generateInt(50, 100),
    totalManuallyUnflaggedCommentsSum: generateInt(50, 100),
    totalUsersSum: generateInt(50, 100)
  };
};

const generateHatefulUserRanks = (): Array<HatefulUserRank> => {
  const ranks: Array<HatefulUserRank> = [];

  for (let i = 0; i < 5; i++) {
    const sum = Math.floor(100 - (i * 10 + generateInt(1, 9)));
    ranks.push({
      ranking: i + 1,
      username: generateString("user"),
      totalHatefulCommentsSum: sum
    });
  }

  return ranks;
};

const generateBoolean = (): boolean => {
  return Math.random() >= 0.5;
};

const generateStatisticalValue = (): StatisticalValue => {
  return {
    average: generateInt(0, 50),
    max: {
      value: generateInt(0, 50),
      intervalDate: new Date()
    },
    min: {
      value: generateInt(0, 50),
      intervalDate: new Date()
    },
    sum: generateInt(0, 50)
  };
};

const generateInt = (max, min = 0) => {
  return Math.floor(Math.random() * (max - min) + min);
};

const generateString = (prefix?: string): string => {
  const S4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return ((prefix ? prefix + "-" : "") + S4());
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const generateReportedComments = (): ReportedComment[] => {
  return [
    {
      classifierClassificationId: 5,
      classifierClassificationText: "NO_HATE",
      sourceAppCommentId: 123,
      timestamp: "2023-01-01T12:12:12.111Z",
      user: "user12122223",
      commentText: "This is a fucking hateful message",
      reviewedByModerator: false,
      moderatorClassificationId: null,
      sourceAppName: "Discord Channel 1",
    },
    {
      classifierClassificationId: 5,
      classifierClassificationText: "NO_HATE",
      sourceAppCommentId: 1234,
      timestamp: "2023-01-02T12:12:12.111Z",
      user: "user1230",
      commentText:
        "This is a fucking hateful message. This is a fucking hateful message. This is a fucking hateful message. This is a fucking hateful message. This is a fucking hateful message. This is a fucking hateful message. This is a fucking hateful message. This is a fucking hateful message. This is a fucking hateful message",
      reviewedByModerator: true,
      moderatorClassificationId: 2,
      sourceAppName: "Discord Channel 1",
    },
    {
      classifierClassificationId: 5,
      classifierClassificationText: "NO_HATE",
      sourceAppCommentId: 123444,
      timestamp: "2023-01-02T13:14:12.111Z",
      user: "user1230",
      commentText: "No Hate!!!",
      reviewedByModerator: true,
      moderatorClassificationId: 0,
      sourceAppName: "Discord Channel 2",
    },
    {
      classifierClassificationId: 5,
      classifierClassificationText: "NO_HATE",
      sourceAppCommentId: 1235,
      timestamp: "2023-01-11T12:12:12.111Z",
      user: "user12151513afaf",
      commentText: "This is a not a hateful message",
      reviewedByModerator: false,
      moderatorClassificationId: null,
      sourceAppName: "Discord Channel 1",
    },
  ];
};

export const generateClassificationCategories = () => {
  /* return [
    {
      "id": 7,
      "classification": "harmful slander"
    },
    {
      "id": 0,
      "classification": "no hate"
    },
    {
      "id": 5,
      "classification": "normalization of existing discrimination"
    }
  ]; */
  const v = CONSTANTS.MESSAGE_TYPES_ALL.reduce(
    (p: any[], c: string, i: number) => {
      return [...p, { classification: c, id: i }];
    }, []);
  return v;
};
