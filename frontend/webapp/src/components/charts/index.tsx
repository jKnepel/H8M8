import React from "react";
import {Grid, Group, Paper, Stack, Title} from "@mantine/core";

export interface ClassNameOnlyProps {
  className?: string;
}

export interface WithTagProp<As extends React.ElementType = React.ElementType>
  extends ClassNameOnlyProps {
  as?: As;
}

export type PropsWithChildren<
  As extends React.ElementType = React.ElementType
> = React.PropsWithChildren<WithTagProp<As>>;

export interface GridProps {
  xs: number,
  sm: number,
  md: number,
  lg: number,
  xl: number,
}

export interface StatisticProps extends PropsWithChildren{
  order?: number,
  gridProps: GridProps
}

export interface StatisticHeaderProps extends PropsWithChildren {
  title: string;
}

export type StatisticContentProps = PropsWithChildren;

export const GRID_PROPS_SMALL : GridProps = {
  xs: 12,
  sm: 12,
  md: 6,
  lg: 6,
  xl: 3,
};

export const GRID_PROPS_MIDDLE : GridProps = {
  xs: 12,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 6,
};

export const GRID_PROPS_BIG : GridProps = {
  xs: 12,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 9,
};

export const GRID_PROPS_LARGE : GridProps = {
  xs: 12,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 12,
};

const Statistic = (props: StatisticProps) => {
  const { children, gridProps, ...rest } = props;

  return (
    <Grid.Col {...gridProps} {...rest}>
      <Paper radius="lg" p="xl" shadow="sm" withBorder>
        <Stack spacing="md" justify="flex-start" h={400}>
          {children}
        </Stack>
      </Paper>
    </Grid.Col>
  );
};

const StatisticHeader = (props: StatisticHeaderProps) => {
  const {children, title, ...rest} = props;

  return (
    <Group spacing="sm" {...rest}>
      <Title order={3}>{title}</Title>
      {children}
    </Group>
  );
};

const StatisticContent = (props: StatisticContentProps) => {
  const {children, ...rest} = props;

  return (
    <Stack {...rest} style={{flexGrow: 1}}>
      {children}
    </Stack>
  );
};

Statistic.Header = StatisticHeader;
Statistic.Content = StatisticContent;
export default Statistic;
