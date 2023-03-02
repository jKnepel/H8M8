import React, { useState } from "react";
import { Radar, RadarChart as RChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from "recharts";
import Statistic, { GRID_PROPS_SMALL } from "../index";
import { RadarChartProps } from "../../../utils/interfaces";
import CustomTooltip from "../custom_tooltip";
import "../style.scss";

const RadarChart = ({
  title,
  showLegend = true,
  showTooltip = true,
  size = GRID_PROPS_SMALL,
  data
}: RadarChartProps) => {
  const [highlightedSource, setHighlightedSource] = useState<string | null>(null);

  return (
    <Statistic gridProps={size}>
      <Statistic.Header title={title} />
      <Statistic.Content>
        {data.data.length != 0 && <ResponsiveContainer width="100%" height="100%">
          <RChart cx="50%" cy="50%" outerRadius="80%" data={data.data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis />
            {showTooltip && <Tooltip
              content={({ active, payload, label }) => <CustomTooltip
                active={active}
                payload={payload}
                label={label}
                headerLabel={"Category"}
              />}
            />}
            {showLegend && <Legend
              align="right"
              onMouseEnter={(e) => setHighlightedSource(e.value)}
              onMouseLeave={() => setHighlightedSource(null)}
            />}
            {data.sources.map(item =>
              <Radar
                key={item.name}
                name={item.name}
                dataKey={item.name}
                stroke={item.color}
                fill={item.color}
                opacity={highlightedSource == item.name || highlightedSource == null ? 0.8 : 0.2}
              />
            )}
          </RChart>
        </ResponsiveContainer>}
      </Statistic.Content>
    </Statistic>
  );
};

export default RadarChart;
