import {rest} from "msw";
import ROUTES from "../../api/routes";
import {
  generateChatGroupOverviewStatistics,
  generateChatGroupStatistics,
  generateClassificationCategories,
  generateReportedComments
} from "./statistics.generator";
import {authMiddleware} from "../utils";

export const overviewMocks = [
  rest.get(ROUTES.STATISTIC_CHATGROUPS_OVERVIEW, (req, res, context) => {
    return authMiddleware(req, res, context,
      () => res(context.delay(), context.json(generateChatGroupOverviewStatistics()), context.status(200)));
  }),
];

export const statisticsMocks = [
  rest.post(ROUTES.STATISTIC_DETAILED, (req, res, context) => {
    return authMiddleware(req, res, context,
      () => res(context.delay(), context.json(generateChatGroupStatistics(new Date(), new Date(), "DAY")), context.status(200)));
  }),
];

export const statisticReportedCommentsMocks = [
  rest.get(ROUTES.STATISTIC_COMMENTS_REPORTED, (req, res, context) => {
    return authMiddleware(req, res, context,
      () => res(context.delay(), context.json(generateReportedComments()), context.status(200)));
  }),
];

export const statisticClassificationCategoryMocks = [
  rest.get(ROUTES.STATISTIC_COMMENTS_CLASSIFICATIONS, (req, res, context) => {
    return authMiddleware(req, res, context,
      () => res(context.delay(), context.json(generateClassificationCategories()), context.status(200)));
  }),
];
