import React, { useMemo, useState } from "react";
import { Select } from "@mantine/core";
import { AreaChart as AChart, Area, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Statistic, { GRID_PROPS_SMALL } from "../index";
import { getGroups, getVisibleGroups } from "../../../utils/statistics_helpers";
import { IntervalChartProps } from "../../../utils/interfaces";
import CustomTooltip from "../custom_tooltip";
import "../style.scss";

const AreaChart = ({
  title,
  showLegend = true,
  showTooltip = true,
  seperateGroups = false,
  size = GRID_PROPS_SMALL,
  unit,
  data
}: IntervalChartProps) => {
  const [selectedChatgroup, setSelectedChatgroup] = useState<string>("all");
  const [highlightedSource, setHighlightedSource] = useState<string | null>(null);

  const groups = useMemo(() => getGroups(data.sources), [data.sources]);

  const visibleGroups = useMemo(() => {
    return getVisibleGroups(seperateGroups, selectedChatgroup, data.sources);
  }, [seperateGroups, selectedChatgroup, data.sources]);

  return (
    <Statistic gridProps={size}>
      <Statistic.Header title={title} />
      <Statistic.Content>
        {seperateGroups && <Select
          maxDropdownHeight={200}
          value={selectedChatgroup}
          data={groups}
          onChange={(chatGroupName: string) => setSelectedChatgroup(chatGroupName)}
          required
        />}
        <ResponsiveContainer width="100%" height="100%">
          <AChart data={data.data}>
            <XAxis axisLine={false} tickLine={false} dataKey="date" />
            <YAxis tickLine={false} axisLine={false} width={50} />
            {showTooltip && <Tooltip
              content={({ active, payload, label }) => <CustomTooltip
                active={active}
                payload={payload}
                label={label}
              />}
            />}
            {showLegend && <Legend
              align="right"
              onMouseEnter={(e) => setHighlightedSource(e.value)}
              onMouseLeave={() => setHighlightedSource(null)}
            />}
            {visibleGroups.map((item) => (
              <React.Fragment key={item.name}>
                <Area
                  name={item.name}
                  dataKey={item.name}
                  stroke={item.color}
                  fill={item.color}
                  unit={unit}
                  opacity={
                    selectedChatgroup == "All"
                      || highlightedSource == item.name
                      || highlightedSource == null
                      ? 0.8
                      : 0.2
                  }
                />
                {(visibleGroups.length === 1 || highlightedSource === item.name) && <>
                  {(item.min?.value || item.min?.value == 0) && <ReferenceLine
                    y={item.min?.value}
                    label={{ value: "Min", position: "insideRight" }}
                    strokeDasharray={"4 3"}
                    isFront
                  />}
                  {(item.max?.value || item.max?.value == 0) && <ReferenceLine
                    y={item.max?.value}
                    label={{ value: "Max", position: "insideRight" }}
                    strokeDasharray={"4 3"}
                    isFront
                  />}
                  {(item.average || item.average == 0) && <ReferenceLine
                    y={item.average}
                    label={{ value: "Average", position: "insideRight" }}
                    strokeDasharray={"4 3"}
                    isFront
                  />}
                </>}
              </React.Fragment>
            ))}
          </AChart>
        </ResponsiveContainer>
      </Statistic.Content>
    </Statistic>
  );
};

export default AreaChart;
