import React, { useState } from 'react';
import { Container, Stack, Title } from '@mantine/core';
import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';
import '../style.scss';

export interface SankeyChartProps {
  title: string,
  showTooltip: boolean,
  data: {
    nodes: {
      name: string
    }[],
    links: {
      source: number,
      target: number,
      value: number
    }[]
  }
}

const SankeyChart = ({ title, showTooltip = false, data, ...rest }: SankeyChartProps) => {

  return (
    <Container {...rest} className={'charts__container'} size={'xs'}>
      <Stack>
        <Title order={3}>{title}</Title>
        <div className={'charts__content'} style={{ height: '300px' }}>
          <ResponsiveContainer width={'100%'} height={'100%'}>
            <Sankey
              data={data}
              nodePadding={50}
            >
              {showTooltip && <Tooltip />}
            </Sankey>
          </ResponsiveContainer>
        </div>
      </Stack>
    </Container>
  );
};

export default SankeyChart;
