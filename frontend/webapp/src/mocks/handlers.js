import { authMocks } from "./auth/auth.mocks";
import {
  overviewMocks,
  statisticsMocks,
  statisticReportedCommentsMocks,
  statisticClassificationCategoryMocks,
} from "./statistics/statistics.mocks";

export const handlers = [
  ...authMocks,
  ...statisticsMocks,
  ...overviewMocks,
  ...statisticReportedCommentsMocks,
  ...statisticClassificationCategoryMocks,
];
