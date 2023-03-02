import {
  Badge,
  Button,
  Group,
  Loader,
  LoadingOverlay,
  Spoiler,
  Stack,
  Text,
} from "@mantine/core";
import moment from "moment";
import React, { useMemo, useContext } from "react";
import { AlertCircle, ArrowMoveRight } from "tabler-icons-react";
import CONSTANTS from "../../utils/constants";
import StatisticContext from "../statistic_context_provider";
import "./style.scss";

const ReportedMessageItem = (props) => {
  const { data, onVerdictEdit, isDisabled, isLoading, ...other } = props;
  const { getClassificationTextFromId } = useContext(StatisticContext);

  return (
    <div
      {...other}
      className={`wbs-moderation-reported-message wbs-moderation-reported-message--${
        data?.reviewedByModerator ? "archived" : "active"
      }`}
    >
      <LoadingOverlay
        visible={isLoading}
        overlayBlur={0.5}
        loader={<Loader color="violet" size="lg" variant="dots" />}
      />
      <div>
        <Group
          spacing="xs"
          my={
            data?.classifierClassificationText || data?.reviewedByModerator
              ? "xs"
              : "0"
          }
        >
          {/* {!data?.reviewed_by_moderator && (
            <Text color="dimmed" size="xs">
              automatically classified as
            </Text>
          )} */}
          {data?.classifierClassificationText && (
            <Badge size="md" color="gray">
              {data?.classifierClassificationText}
            </Badge>
          )}
          {data?.reviewedByModerator && (
            <>
              {data?.classifierClassificationText && (
                <Group spacing="xs">
                  {/* <Text color="dimmed" size="xs">
                  reclassified as
                </Text> */}
                  <ArrowMoveRight size={26} strokeWidth={1} />
                </Group>
              )}
              <Badge size="md" color="gray" variant="filled">
                {getClassificationTextFromId(data?.moderatorClassificationId)}
              </Badge>
            </>
          )}
        </Group>
        <Group position="apart" noWrap>
          <div spacing="xs">
            <Text c="dimmed" size="sm">{`On ${moment(
              data.timestamp,
              CONSTANTS.ZULU_TIMESTAMP_FORMAT
            ).format(CONSTANTS.DEFAULT_TIMESTAMP)}, ${data.user} wrote:`}</Text>
            <Spoiler
              maxHeight={50}
              showLabel="Show whole message"
              hideLabel="Hide"
            >
              <Text size="md">{data.commentText}</Text>
            </Spoiler>
          </div>
          <Button
            disabled={isDisabled}
            size="md"
            variant="subtle"
            color={data?.reviewedByModerator ? "gray" : "violet"}
            onClick={(_) => {
              onVerdictEdit(data);
            }}
          >
            {data?.reviewedByModerator
              ? "Edit Classification"
              : "Classify Comment"}
          </Button>
        </Group>
      </div>
    </div>
  );
};

export default React.memo(ReportedMessageItem);
