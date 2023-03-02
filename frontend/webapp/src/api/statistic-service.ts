import moment from "moment";
import CONSTANTS from "../utils/constants";
import api from "./api";
import ROUTES from "./routes";

export interface DetailedStatisticsRequestBody {
  isMerged: boolean,
  timeInterval: string,
  timeStart: moment.Moment,  // "2023-01-01T19:49:12.837Z"
  timeEnd: moment.Moment,    // "2023-01-01T19:49:12.837Z"
  chatGroups: Int16Array
}

export interface ClassifyReportedCommentRequestBody {
  sourceAppName: string,
  sourceAppCommentId: string,
  manualClassificationId: number
}

const fetchDetailedStatistics = async (requestBody: DetailedStatisticsRequestBody) => {
  const _requestBody = {
    ...requestBody,
    timeStart: requestBody.timeStart.format(CONSTANTS.ZULU_TIMESTAMP_FORMAT),
    timeEnd: requestBody.timeEnd.format(CONSTANTS.ZULU_TIMESTAMP_FORMAT),
  };
  const response = await api.post<unknown>(ROUTES.STATISTIC_DETAILED, _requestBody);
  return response.data;
};

const fetchChatgroupOverview = async () => {
  const response = await api.get<unknown>(ROUTES.STATISTIC_CHATGROUPS_OVERVIEW);
  return response.data;
};

const fetchReportedComments = async () => {
  const response = await api.get<unknown>(ROUTES.STATISTIC_COMMENTS_REPORTED);
  return response.data;
};

const classifyReportedCommentManually = async (requestBody: ClassifyReportedCommentRequestBody) => {
  const response = await api.post<unknown>(ROUTES.STATISTIC_COMMENTS_CLASSIFY_MANUALLY, requestBody);
  return response.data;
};

const fetchClassificationCategories = async () => {
  const response = await api.get<unknown>(ROUTES.STATISTIC_COMMENTS_CLASSIFICATIONS);
  return response.data;
};

const StatisticService = {
  fetchDetailedStatistics,
  fetchChatgroupOverview,
  fetchReportedComments,
  classifyReportedCommentManually,
  fetchClassificationCategories
};

export default StatisticService;
