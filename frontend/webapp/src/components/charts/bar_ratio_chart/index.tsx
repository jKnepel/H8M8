import React, { useCallback, useMemo, useState } from "react";
import { Select } from "@mantine/core";
import { Bar, BarChart as BChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getGroups, getVisibleGroups } from "../../../utils/statistics_helpers";
import { RatioChartProps } from "../../../utils/interfaces";
import Statistic, { GRID_PROPS_SMALL } from "../index";
import { Payload } from "recharts/types/component/DefaultLegendContent";
import "../style.scss";

const BarRatioChart = ({
  title,
  showLegend = true,
  showTooltip = true,
  seperateGroups = false,
  size = GRID_PROPS_SMALL,
  data
}: RatioChartProps) => {
  const [selectedChatgroup, setSelectedChatgroup] = useState<string>("all");

  // calculate ratio for each interval and each group
  const formattedData = useMemo(() => {
    return data.data.map((interval) => {
      // calculate total for each group
      const sources = {};
      for (const property in data.sources) {
        sources[data.sources[property].id] = 0;
      }

      for (const property in interval) {
        if (property !== "date") {
          const splitId = property.split("!#");
          sources[splitId[1]] += interval[property] as number;
        }
      }

      // calculate ratio for each group
      let ratios = { date: interval.date };
      for (const property in interval) {
        if (property !== "date") {
          const total = sources[property.split("!#")[1]];
          ratios = {
            ...ratios,
            [property]: total > 0 ? Math.floor((interval[property] as number) / total * 100) : 0
          };
        }
      }
      return ratios;
    });
  }, [data]);

  const groups = useMemo(() => getGroups(data.sources), [data.sources]);

  const visibleGroups = useMemo(() => {
    return getVisibleGroups(seperateGroups, selectedChatgroup, data.sources);
  }, [seperateGroups, selectedChatgroup, data.sources]);

  const legendPayload = useMemo((): Payload[] => {
    return data.ratios.map((ratio) => {
      return { value: ratio.name, type: "rect", color: ratio.color };
    });
  }, [data.ratios]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart__tooltip">
          <div className="chart__tooltip-header">Date: {label}</div>
          {visibleGroups.map((source) => (
            <React.Fragment key={source.id}>
              <h5 className="chart__tooltip-dataHeader">{source.name}:</h5>
              {payload
                .filter((property) => property.dataKey.split("!#")[1] == source.id)
                .map((ratio) => (
                  <h6 key={ratio.dataKey} className="chart__tooltip-dataLabel" style={{ color: ratio.color }}>
                    {ratio.dataKey.split("!#")[0]}: {ratio.value}%
                  </h6>
                ))
              }
            </React.Fragment>
          ))}
        </div>
      );
    }

    return null;
  };

  const tickFormatter = useCallback((value) => {
    return value + "%";
  }, []);

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
          <BChart data={formattedData}>
            <XAxis axisLine={false} tickLine={false} dataKey="date" />
            <YAxis tickFormatter={tickFormatter} tickLine={false} axisLine={false} width={40} domain={[0, 100]} />
            {showLegend && <Legend align="right" payload={legendPayload} />}
            {showTooltip && <Tooltip
              content={({ active, payload, label }) => <CustomTooltip
                active={active}
                payload={payload}
                label={label}
              />}
            />}
            {visibleGroups?.map((group) => (
              data.ratios?.map((ratio, index) => (
                <Bar
                  key={ratio.name + "!#" + group.id}
                  name={ratio.name + "!#" + group.name}
                  dataKey={ratio.name + "!#" + group.id}
                  stackId={group.id}
                  fill={ratio.color}
                  radius={index === 0 ? [0, 0, 8, 8] : (index === data.ratios.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0])}
                />
              ))
            ))}
          </BChart>
        </ResponsiveContainer>
      </Statistic.Content>
    </Statistic>
  );
};

export default BarRatioChart;
