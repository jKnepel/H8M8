import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Center,
  Divider,
  Group,
  LoadingOverlay,
  Modal,
  MultiSelect,
  Select,
  Space,
  Spoiler,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import moment from "moment";
import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useContext,
} from "react";
import { useMutation, useQuery } from "react-query";
import { Refresh, SortAscending, SortDescending } from "tabler-icons-react";
import StatisticService from "../../api/statistic-service";
import { PageHeadingWithHelper } from "../../components/page_heading";
import ReportedMessageItem from "../../components/reported_message_item";
import StatisticContext from "../../components/statistic_context_provider";
import CONSTANTS from "../../utils/constants";
import "./style.scss";

const ModerationPage = () => {
  const {
    classificationsData,
    isLoadingClassificationsData,
    filterOptionsClassificationsData,
  } = useContext(StatisticContext);
  const [archivedReportData, setArchivedReportData] = useState();
  const [_data, _setData] = useState();
  const [selectedCommentForVerdict, setSelectedCommentForVerdict] = useState();
  const [opened, setOpened] = useState(false);
  const [error, setError] = useState();
  const [lastVerdict, setLastVerdict] = useState();
  const [sortOption, setSortOption] = useState("none");
  const [filterOption, setFilterOption] = useState("all");
  const [sortOrderAscending, setSortOrderAscending] = useState(false);

  const {
    data,
    isLoading: isLoadingReportedComments,
    isFetching: isFetchingReportedComments,
    refetch,
  } = useQuery(
    "STATISTIC_COMMENTS_REPORTED",
    StatisticService.fetchReportedComments,
    { refetchOnWindowFocus: "always" }
  );
  const { mutate, isLoading: isLoadingReportedCommentsClassify } = useMutation(
    "STATISTIC_COMMENTS_REPORTED_CLASSIFY",
    StatisticService.classifyReportedCommentManually,
    {
      onSuccess: (d) => {
        // TODO: use returned data (d) instead of selectedItem from State!!!
        const selectedItem = {
          ...selectedCommentForVerdict,
          reviewedByModerator: true,
          moderatorClassificationId: lastVerdict,
        };
        // add to archived items
        setArchivedReportData((old) => {
          if (!old) return [selectedItem];
          // if archived items already contains current selection, dont change state
          const _old = [...old];
          const hasItem = old.some(
            (e) => selectedItem?.sourceAppCommentId === e?.sourceAppCommentId
          );
          if (hasItem) {
            _old.forEach((e) => {
              if (selectedItem?.sourceAppCommentId === e?.sourceAppCommentId) {
                e.moderatorClassificationId =
                  selectedItem.moderatorClassificationId;
              }
            });
            return _old;
          }
          // if does not exist yet, add it!
          return [...old, selectedItem];
        });
        // remove from active items
        _setData((old) => {
          if (!old) return [];
          return old.filter(
            (e) => selectedItem?.sourceAppCommentId !== e?.sourceAppCommentId
          );
        });
      },
    }
  );

  useEffect(() => {
    _setData(data);
  }, [data]);

  const createdAtComparison = useMemo(() => {
    return (a, b) => {
      if (
        moment(a.timestamp, CONSTANTS.ZULU_TIMESTAMP_FORMAT).isBefore(
          moment(b.timestamp, CONSTANTS.ZULU_TIMESTAMP_FORMAT)
        )
      ) {
        return sortOrderAscending ? -1 : 1;
      }
      if (
        moment(a.timestamp, CONSTANTS.ZULU_TIMESTAMP_FORMAT).isAfter(
          moment(b.timestamp, CONSTANTS.ZULU_TIMESTAMP_FORMAT)
        )
      ) {
        return sortOrderAscending ? 1 : -1;
      }
      return 0;
    };
  }, [sortOrderAscending]);

  const createdByComparison = useMemo(() => {
    return (a, b) => {
      if (a.user < b.user) {
        return sortOrderAscending ? -1 : 1;
      }
      if (a.user > b.user) {
        return sortOrderAscending ? 1 : -1;
      }
      return 0;
    };
  }, [sortOrderAscending]);

  const activeReports = useMemo(() => {
    return !_data
      ? []
      : _data.filter(
          (e) =>
            !e?.reviewedByModerator &&
            (e?.sourceAppName === filterOption || filterOption === "all")
        );
  }, [_data, filterOption]);

  const activeSortedReports = useMemo(() => {
    if (!activeReports) return [];
    const _activeReports = [...activeReports];
    if (sortOption === "createdBy") {
      return _activeReports.sort(createdByComparison);
    } else if (sortOption === "createdAt") {
      return _activeReports.sort(createdAtComparison);
    } else {
      return _activeReports;
    }
  }, [activeReports, createdAtComparison, createdByComparison, sortOption]);

  const archivedReports = useMemo(() => {
    return !archivedReportData
      ? []
      : archivedReportData.filter(
          (e) => e?.sourceAppName === filterOption || filterOption === "all"
        );
  }, [archivedReportData, filterOption]);

  const availableSourceAppOptions = useMemo(() => {
    return !_data
      ? [{ value: "all", label: "All" }]
      : _data.reduce(
          (p, c) => {
            const v = c?.sourceAppName;
            // don't add new option if value is null or value already exists as option
            if (!v || p.some((item) => item.value === v)) return p;
            return [...p, { value: v, label: v }];
          },
          [{ value: "all", label: "All" }]
        );
  }, [_data]);

  const archivedSortedReports = useMemo(() => {
    if (!archivedReports) return [];
    const _archivedReports = [...archivedReports];
    if (sortOption === "createdBy") {
      return _archivedReports.sort(createdByComparison);
    } else if (sortOption === "createdAt") {
      return _archivedReports.sort(createdAtComparison);
    } else {
      return _archivedReports;
    }
  }, [archivedReports, createdAtComparison, createdByComparison, sortOption]);

  const openVerdict = useCallback((commentItem) => {
    setOpened(true);
    setLastVerdict(commentItem?.moderatorClassificationId);
    setSelectedCommentForVerdict(commentItem);
  }, []);

  const closeVerdict = useCallback(() => {
    setOpened(false);
    setLastVerdict(null);
    setError(null);
    //setSelectedCommentForVerdict(null);
  }, []);

  const saveVerdict = useCallback(() => {
    if (lastVerdict === undefined || lastVerdict === null) {
      setError("Please set this field");
      return;
    }

    const mutationData = {
      sourceAppName: selectedCommentForVerdict?.sourceAppName,
      sourceAppCommentId: selectedCommentForVerdict?.sourceAppCommentId,
      manualClassificationId: lastVerdict,
    };
    mutate(mutationData);
    closeVerdict();
  }, [closeVerdict, lastVerdict, selectedCommentForVerdict, mutate]);

  return (
    <div className="wbs-moderation-page wsb-page-content">
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Classification"
      >
        <Stack>
          <div>
            <Text color="dimmed" size="sm">
              Comment:
            </Text>
            <Spoiler
              maxHeight={120}
              showLabel="Show whole message"
              hideLabel="Hide"
            >
              <Text size="lg">{selectedCommentForVerdict?.commentText}</Text>
            </Spoiler>
          </div>
          {!selectedCommentForVerdict?.reviewedByModerator &&
            selectedCommentForVerdict?.classifierClassificationText && (
              <Alert>
                <Text>
                  This message was automatically classified as
                  <Badge size="md" color="gray">
                    {selectedCommentForVerdict?.classifierClassificationText ??
                      ""}
                  </Badge>
                  . Is this classification correct?
                </Text>
              </Alert>
            )}
          <Select
            onChange={setLastVerdict}
            error={error}
            withAsterisk
            label="How would you classify this comment?"
            placeholder="Classification"
            data={filterOptionsClassificationsData}
            disabled={isLoadingClassificationsData}
            value={lastVerdict}
          />
          <Group position="right">
            <Button onClick={saveVerdict} size="md">
              Save
            </Button>
            <Button
              onClick={closeVerdict}
              size="md"
              variant="light"
              color="gray"
            >
              Close
            </Button>
          </Group>
        </Stack>
      </Modal>
      <PageHeadingWithHelper storageId="moderation" title="Moderation">
        <Text mb="md">
          On the moderation page, you can view reported comments. Some reported
          comments were classified automatically by our system, so they have an
          initial classification. You can reclassify/classify each comment. The
          manually classified comments will then appear in the archived section,
          but only during your current session!
        </Text>
        <Badge size="md" color="gray">
          automcatically classifcation badge
        </Badge>
        <Badge size="md" color="gray" variant="filled">
          manual classifcation badge
        </Badge>
      </PageHeadingWithHelper>
      <Group position="apart">
        <Select
          placeholder="Select Source App"
          data={availableSourceAppOptions}
          value={filterOption}
          onChange={setFilterOption}
        />
        <Group>
          <Select
            value={sortOption}
            onChange={setSortOption}
            placeholder="Sorting"
            data={[
              { value: "createdAt", label: "Created at" },
              { value: "createdBy", label: "Created by User" },
              { value: "none", label: "No Sorting" },
            ]}
          />
          {sortOption !== "none" && (
            <ActionIcon
              size="lg"
              variant="light"
              onClick={(_) => {
                setSortOrderAscending((old) => !old);
              }}
            >
              {sortOrderAscending ? (
                <SortAscending size={26} />
              ) : (
                <SortDescending size={26} />
              )}
            </ActionIcon>
          )}
        </Group>
      </Group>
      <Space h={"xl"} />
      <Group mt="lg" position="apart">
        <Group>
          <Title order={2}>Active Reports</Title>
          <Badge size="lg">{activeReports.length}</Badge>
        </Group>
        <Button
          variant="light"
          color="gray"
          compact
          onClick={refetch}
          rightIcon={<Refresh size={16} />}
          disabled={isLoadingReportedComments || isFetchingReportedComments}
        >
          Refetch
        </Button>
      </Group>
      <div>
        <LoadingOverlay
          visible={isLoadingReportedComments || isFetchingReportedComments}
          overlayBlur={0.5}
        />
        {activeSortedReports && activeSortedReports?.length !== 0 ? (
          <>
            {activeSortedReports.map((e, i) => (
              <ReportedMessageItem
                data={e}
                key={i}
                onVerdictEdit={openVerdict}
                isLoading={
                  `${selectedCommentForVerdict?.sourceAppCommentId}` ===
                    `${e?.sourceAppCommentId}` &&
                  isLoadingReportedCommentsClassify
                }
                isDisabled={isLoadingReportedCommentsClassify}
              />
            ))}
          </>
        ) : (
          <Center style={{ height: 100 }}>
            <Text color="dimmed">
              {"All caught up! There are no active comments open for review 😊"}
            </Text>
          </Center>
        )}
      </div>
      <Group mt="lg">
        <Title order={2}>Archived Reports</Title>
        <Badge size="lg">{archivedReports.length}</Badge>
      </Group>
      {archivedSortedReports.map((e, i) => (
        <ReportedMessageItem
          data={e}
          key={i}
          onVerdictEdit={openVerdict}
          isLoading={
            `${selectedCommentForVerdict?.sourceAppCommentId}` ===
              `${e?.sourceAppCommentId}` && isLoadingReportedCommentsClassify
          }
          isDisabled={isLoadingReportedCommentsClassify}
        />
      ))}
    </div>
  );
};

export default ModerationPage;
