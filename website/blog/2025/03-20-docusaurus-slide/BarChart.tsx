import * as React from 'react';
import { BarChart, barElementClasses } from '@mui/x-charts/BarChart';
import { axisClasses } from '@mui/x-charts/ChartsAxis';

export default function BasicBars() {
  const colors: string[] = ['#006BD6', '#EC407A'];
  const baseColor = 'var(--ifm-color-primary-dark)'; // カスタムCSS変数を使用
  return (
    <BarChart
      xAxis={[
        {
          scaleType: 'band',
          data: ['group A', 'group B', 'group C'],
          labelStyle: { color: 'var(--ifm-color-emphasis-100)', fontWeight: 'bold' }, // カスタムCSS変数を使用
        },
      ]}
      series={[
        { data: [4, 3, 5] },
        { data: [1, 6, 3] },
        { data: [2, 5, 6] },
      ]}
      width={500}
      height={300}
      sx={(theme) => ({
        [`.${axisClasses.root}`]: {
          [`.${axisClasses.tick}, .${axisClasses.line}`]: {
            stroke: `${baseColor}`,
            strokeWidth: 1.5,
          },
          [`.${axisClasses.tickLabel}`]: {
            fill: `${baseColor}`,
          },
        },
      })}
    />
  );
}