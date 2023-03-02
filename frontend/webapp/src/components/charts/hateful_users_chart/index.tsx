import React, { useEffect, useState } from "react";
import { Avatar, Grid, Group, Select, Stack, Title } from "@mantine/core";
import Statistic, { GRID_PROPS_SMALL } from "../index";
import { HatefulUsersChartProps } from "../../../utils/interfaces";
import { hex_sha256 } from "../../../utils/sha256";
import "../style.scss";

const HatefulUsersChart = ({ size = GRID_PROPS_SMALL, data }: HatefulUsersChartProps) => {
  const [chatgroupSelectData, setChatgroupSelectData] = useState<(string)[]>([""]);
  const [selectedChatgroup, setSelectedChatgroup] = useState<string>("");
  const [categorySelectData, setCategorySelectData] = useState<(string)[]>([""]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    setChatgroupSelectData(Object.keys(data));
    setSelectedChatgroup(Object.keys(data)[0]);
  }, [data]);

  useEffect(() => {
    const chatgroup = data[selectedChatgroup];
    if (!chatgroup) return;
    setCategorySelectData(chatgroup?.map((category) => category?.categoryName));
  }, [data, selectedChatgroup]);

  useEffect(() => {
    if (!categorySelectData.find((category) => category === selectedCategory))
      setSelectedCategory(categorySelectData[0]);
  }, [categorySelectData, selectedCategory]);

  return (
    <Statistic gridProps={size}>
      <Statistic.Header title="Top Hateful Users" />
      <Statistic.Content>
        <Grid columns={2}>
          <Grid.Col span={1}>
            <Select
              size="sm"
              placeholder="Chatgroups"
              maxDropdownHeight={200}
              data={chatgroupSelectData}
              value={selectedChatgroup}
              onChange={(value: string) => setSelectedChatgroup(value)}
              required
            />
          </Grid.Col>
          <Grid.Col span={1}>
            <Select
              size="sm"
              placeholder="Categories"
              maxDropdownHeight={200}
              data={categorySelectData}
              value={selectedCategory}
              onChange={(value: string) => setSelectedCategory(value)}
              required
            />
          </Grid.Col>
        </Grid>
        <Stack spacing="sm">
          {data[selectedChatgroup] && data[selectedChatgroup]
            .find((category) => category?.categoryName == selectedCategory)?.users
            .sort((a, b) => a.ranking > b.ranking ? 1 : 0)
            .map((user, index) =>
              <Group align={"center"} key={user.ranking} noWrap>
                <Title order={index === 0 ? 2 : 4}>#{user.ranking}</Title>
                <Avatar 
                  radius={"xl"}
                  color={"cyan.4"}
                  size={index === 0 ? "lg" : "md"}
                  src={`https://api.dicebear.com/5.x/adventurer/svg?seed=${hex_sha256(`${selectedChatgroup}!${user.username}`)}`}
                />
                <Stack spacing={0} justify={"center"}>
                  <Title order={index === 0 ? 5 : 6} style={{ transform: "translateY(2.5px)" }}>{user.totalHatefulCommentsSum} Hateful Comments</Title>
                  <Title order={index === 0 ? 3 : 5} style={{ transform: "translateY(-2.5px)" }}>{user.username}</Title>
                </Stack>
              </Group>
            )
          }
        </Stack>
      </Statistic.Content>
    </Statistic>
  );
};

export default HatefulUsersChart;
