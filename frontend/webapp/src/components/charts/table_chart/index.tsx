import React, { useEffect, useMemo, useState } from "react";
import { Pagination, Select, SimpleGrid, Stack, Title } from "@mantine/core";
import { TableChartProps } from "../../../utils/interfaces";
import Statistic, { GRID_PROPS_SMALL } from "../index";
import "../style.scss";

const TableChart = ({ title, size = GRID_PROPS_SMALL, data }: TableChartProps) => {
  const [chatgroupSelectData, setChatgroupSelectData] = useState<(string)[]>(["All"]);
  const [selectedChatgroup, setSelectedChatgroup] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const numberVisibleEntries = size === GRID_PROPS_SMALL ? 4 : 6;
  
  const entries = useMemo(() => {
    return data[selectedChatgroup] ? Object.entries(data[selectedChatgroup]) : [];
  }, [data, selectedChatgroup]);

  useEffect(() => {
    setChatgroupSelectData(Object.keys(data));
    setSelectedChatgroup(Object.keys(data)[0]);
  }, [data]);

  useEffect(() => {
    if (currentPage > ((entries.length / numberVisibleEntries) + 1))
      setCurrentPage(1);
  }, [currentPage, entries, numberVisibleEntries, selectedChatgroup]);

  return (
    <Statistic gridProps={size}>
      <Statistic.Header title={title} />
      <Statistic.Content>
        <Select
          maxDropdownHeight={200}
          value={selectedChatgroup}
          data={chatgroupSelectData}
          onChange={(value: string) => setSelectedChatgroup(value)}
        />
        <SimpleGrid cols={numberVisibleEntries / 2} style={{ flexGrow: 1 }}>
          {entries
            .slice((currentPage - 1) * numberVisibleEntries, (currentPage - 1) * (numberVisibleEntries) + numberVisibleEntries)
            .map((datum, index) =>
              <Stack justify="center" align="center" key={index}>
                <Title order={5} color="dimmed">{datum[0]}</Title>
                <Title order={2}>{datum[1]}</Title>
              </Stack>
            )
          }
        </SimpleGrid>
        {entries.length > numberVisibleEntries && <Pagination
          page={currentPage}
          onChange={setCurrentPage}
          total={(entries.length / numberVisibleEntries) + 1}
          withControls={false}
          position={"right"}
        />}
      </Statistic.Content>
    </Statistic>
  );
};

export default TableChart;
