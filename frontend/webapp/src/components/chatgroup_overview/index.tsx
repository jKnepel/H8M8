import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Button, Flex, Grid, Paper, Text, ThemeIcon, Title } from "@mantine/core";
import { AlertCircle, ArrowRight, BrandDiscord, BrandTelegram, CircleCheck, MessageChatbot, Messages, Percentage, ShieldCheck } from "tabler-icons-react";
import { ChatgroupOverview } from "../../utils/interfaces";
import { getFormattedElapsedTime } from "../../utils/helpers";
import "./style.scss";

interface ChatgroupOverviewProps {
  data: ChatgroupOverview
}

const ChatGroupOverview = ({ data, ...rest }: ChatgroupOverviewProps) => {
  const navigate = useNavigate();
  const navigateToDashboard = useCallback(() => navigate(`/dashboard?ids=${data.chatGroupId}`), [navigate, data]);
  const [elapsedSinceSessionStart, setElapsedSinceSessionStart] = useState<string>(getFormattedElapsedTime(data.sessionInfo.sessionStart));
  const [elapsedSinceSessionEnd, setElapsedSinceSessionEnd] = useState<string>(getFormattedElapsedTime(data.sessionInfo.sessionEnd));

  const latestRatio = (data.latestSession.totalHatefulCommentsSum ?? 0  ) / (data.latestSession.totalCommentsSum ?? 1);
  const allRatio = (data.allSessions.totalHatefulCommentsSum ?? 0) / (data.allSessions.totalCommentsSum ?? 1);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSinceSessionStart(getFormattedElapsedTime(data.sessionInfo.sessionStart));
      setElapsedSinceSessionEnd(getFormattedElapsedTime(data.sessionInfo.sessionEnd));
    }, 1000);
    return () => clearInterval(interval);
  }, [data.sessionInfo.sessionEnd, data.sessionInfo.sessionStart]);

  const sourceAppLogo = useMemo(
    () => {
      let sourceAppClass: string | null = null;
      let sourceAppIcon = <MessageChatbot size={30} strokeWidth={2} />;
      if (data?.sourceAppName === "discord") {
        sourceAppClass = "discord";
        sourceAppIcon = <BrandDiscord size={30} strokeWidth={2} />;
      }
      else if (data?.sourceAppName === "telegram") {
        sourceAppClass = "telegram";
        sourceAppIcon = <BrandTelegram size={30} strokeWidth={2} />;
      }
      return <div className={`cgo-item__header-icon ${sourceAppClass ? `cgo-item__header-icon--${sourceAppClass}` : ""}`}>
        {sourceAppIcon}
      </div>;
    },
    [data],
  );

  return (
    <Paper shadow="xs" withBorder p="md" radius="lg" className="cgo-item">
      <div className="cgo-item__header">
        {sourceAppLogo}
        <div className="cgo-item__header-title-container">
          <Title order={2} className="cgo-item__header-title-container__title">{data.chatGroupName}</Title>
          {data.serverName && (<>
            <span className="cgo-item__header-divider">/</span>
            <Title order={2} className="cgo-item__header-title-container__subtitle">{data.serverName}</Title>
          </>)}
        </div>
        <Flex>
          {data.sessionInfo.isOnline
            ? <>
              <Text color="teal">Online for {elapsedSinceSessionStart}</Text>
              <ThemeIcon color="teal" size="md" radius="xl"
                className="cgo-item__header-statusicon">
                <CircleCheck />
              </ThemeIcon>
            </>
            : <>
              <Text color="gray">Offline for {elapsedSinceSessionEnd}</Text>
              <ThemeIcon color="gray" size="md" radius="xl"
                className="cgo-item__header-statusicon">
                <AlertCircle />
              </ThemeIcon>
            </>
          }
        </Flex>
      </div>
      <Grid className="cgo-item__content">
        <ChatGroupStatisticsItem
          total={data.latestSession.totalCommentsSum}
          hateful={data.latestSession.totalHatefulCommentsSum}
          ratio={latestRatio}
          isCurrentSession={true}
        />
        <ChatGroupStatisticsItem
          total={data.allSessions.totalCommentsSum}
          hateful={data.allSessions.totalHatefulCommentsSum}
          ratio={allRatio}
          isCurrentSession={false}
        />
      </Grid>
      <div className="cgo-item__action">
        <Button variant="light" color="gray" rightIcon={<ArrowRight size={22} />} onClick={navigateToDashboard}>Show Statistics</Button>
      </div>
    </Paper>
  );
};

const ChatGroupStatisticsItem = ({ total, hateful, ratio, isCurrentSession }) => {
  return (
    <Grid.Col span={12} xl={6} className="cgo-item__indicator">
      <div className="cgo-item__title">{isCurrentSession ? "Current session" : "All sessions"}</div>
      <div className="cgo-item__indicator-wrapper">
        <div className="cgo-item__indicator-container">
          <div className="cgo-item__indicator-icon">
            <Messages
              size={25}
              strokeWidth={2}
            />
          </div>
          <div className="cgo-item__indicator-value-container">
            <Text fz="lg">
              {total}
            </Text>
            <Text color="dimmed" fz="sm">
              Total comments
            </Text>
          </div>
        </div>
        <div className="cgo-item__indicator-container">
          <div className="cgo-item__indicator-icon">
            <ShieldCheck
              size={25}
              strokeWidth={2}
            />
          </div>
          <div className="cgo-item__indicator-value-container">
            <Text fz="lg">
              {hateful}
            </Text>
            <Text color="dimmed" fz="sm">
              Total hateful comments
            </Text>
          </div>
        </div>
        <div className="cgo-item__indicator-container">
          <div className="cgo-item__indicator-icon">
            <Percentage
              size={25}
              strokeWidth={2}
            />
          </div>
          <div className="cgo-item__indicator-value-container">
            <Text fz="lg">
              {hateful && total && Math.round(ratio * 100) + "%"}
            </Text>
            <Text color="dimmed" fz="sm">
              Ratio hateful / non-hateful
            </Text>
          </div>
        </div>
      </div>
      <div className="cgo-item__progress">
        <div className="cgo-item__progress-inner" style={{ width: ratio * 100 + "%" }}></div>
      </div>
    </Grid.Col>
  );
};

export default ChatGroupOverview;
