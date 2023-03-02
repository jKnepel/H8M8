import { GridProps } from "../components/charts";
import { Color } from "./types";

export interface ChatgroupOverview {
  sourceAppName: string,
  sourceAppId: string,
  chatGroupName: string,
  chatGroupId: string,
  serverName: string | null,
  sessionInfo: {
    isOnline: boolean,
    sessionStart: Date | null,
    sessionEnd: Date | null
  },
  latestSession: {
    totalCommentsSum: number | null,
    totalHatefulCommentsSum: number | null
  },
  allSessions: {
    totalCommentsSum: number | null,
    totalHatefulCommentsSum: number | null
  }
}

export interface ExtremaValue {
  value: number | null,
  intervalDate: Date | null,
}

export interface StatisticalValue {
  sum: number | null,
  average: number | null,
  max: ExtremaValue,
  min: ExtremaValue
}

export interface ReportedComment {
  classifierClassificationId: number | null,
  classifierClassificationText: string | null,
  sourceAppCommentId: number,
  timestamp: string,
  user: string,
  commentText: string,
  reviewedByModerator: boolean,
  moderatorClassificationId: number | null,
  sourceAppName: string,
}

export interface HatefulUserRank {
  username: string,
  ranking: number,
  totalHatefulCommentsSum: number
}

export interface StatisticalInterval {
  intervalDate: Date | null,
  totalUsersSum: number | null,
  totalCommentsSum: number | null,
  totalHatespeechCommentsSum: number | null,
  totalManuallyFlaggedCommentsSum: number | null,
  totalAutomaticallyFlaggedCommentsSum: number | null,
  totalManuallyUnflaggedCommentsSum: number | null,
  totalHatespeechComments: {
    categoryName: string,
    totalSum: number | null
  }[],
}

export interface ChatgroupStatistic {
  sourceAppName: string,
  sourceAppId: string | number,
  chatGroupName: string,
  chatGroupId: string | number,
  serverName: string,
  sessionInfo: {
    isCurrentSession: boolean,
    sessionStart: Date | null,
    sessionEnd: Date | null,
  }[],
  totalComments: StatisticalValue,
  totalHatespeechComments: StatisticalValue,
  totalHatespeechCommentsPerCategory: {
    categoryName: string,
    totalSum: number | null
  }[],
  totalUsers: StatisticalValue,
  totalManuallyFlaggedComments: StatisticalValue,
  totalAutomaticallyFlaggedComments: StatisticalValue,
  totalManuallyUnflaggedComments: StatisticalValue,
  totalHatefulUsers: StatisticalValue,
  mostHatefulUsers: {
    general: HatefulUserRank[],
    categories: {
      categoryName: string,
      users: HatefulUserRank[]
    }[]
  },
  intervalData: StatisticalInterval[]
}

export interface ChatgroupStatistics {
  isMerged: false,
  timeInterval: string,
  timeStart: Date,
  timeEnd: Date,
  data: ChatgroupStatistic[]
}

//-----------------------------------Chart Props-----------------------------------

interface StandardChartProps {
  title: string,
  size?: GridProps,
  data: Record<string, unknown>
}

export interface Source {
  id: string | number,
  name: string,
  color: Color,
  min?: ExtremaValue,
  max?: ExtremaValue,
  average?: number | null
}

export interface IntervalDictionary {
  [date: string]: {
    date: string
  }
}

export interface Interval {
  date: string,
  [sourceName: string]: number | string
}

export interface IntervalChartProps extends StandardChartProps {
  showLegend?: boolean,
  showTooltip?: boolean,
  seperateGroups?: boolean,
  unit?: string,
  data: {
    sources: Source[],
    data: Interval[]
  }
}

export interface RadarDictionary {
  [subject: string]: {
    subject: string,
    [groupname: string]: number | string
  }
}

export interface Radar {
  subject: string,
  [groupname: string]: number | string
}

export interface RadarChartProps extends StandardChartProps {
  showLegend?: boolean,
  showTooltip?: boolean,
  seperateGroups?: boolean,
  data: {
    sources: Source[],
    data: Radar[]
  }
}

export interface Ratio {
  name: string,
  color: Color
}

export interface RatioChartProps extends StandardChartProps {
  showLegend?: boolean,
  showTooltip?: boolean,
  seperateGroups?: boolean,
  data: {
    ratios: Ratio[],
    sources: Source[],
    data: Interval[]
  }
}

export interface TableChartData {
  [groupname: string]: {
    [label: string]: number
  }
}

export interface TableChartProps extends StandardChartProps {
  data: TableChartData 
}

export interface HatefulUsersData {
  [groupname: string]: {
    categoryName: string,
    users: HatefulUserRank[]
  }[]
}

export interface HatefulUsersChartProps extends StandardChartProps {
  data: HatefulUsersData
}
