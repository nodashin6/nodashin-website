"use client";

import React from 'react';
import { Box, Typography, Stack, Grid2 } from '@mui/material';
import { AppLayout, Slide } from './_App';
import BasicBars from './BarChart';
import Timeline from './Timeline';
import CodeBlock from '@theme/CodeBlock';

const PythonCode = `\
def add(a, b) -> int:
    return a + b

print("Hello, World!")
`;

const App = () => {
  return (
    <AppLayout>
        <Slide title="グラフのあるスライド">
            <Stack 
                spacing={2}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 2,
                }}
            >
                <Typography variant="h3">サマリー</Typography>
                <BasicBars />
            </Stack>

        </Slide>
        <Slide title="プログラムのあるスライド">
            <Grid2 container spacing={2}>
                <Grid2 size={6}>
                    <Typography variant="h3">左側のスライド</Typography>
                    <Typography variant="body1">
                        足し算とHello Worldを表示するプログラムです。
                    </Typography>
                </Grid2>
                <Grid2 size={6}>
                    <Typography variant="h3">右側のスライド</Typography>
                    <CodeBlock
                        className="language-python"
                    >
                        {PythonCode}
                    </CodeBlock>
                </Grid2>
            </Grid2>
        </Slide>
        <Slide title="タイムラインのあるスライド">
            <Timeline />
        </Slide>
    </AppLayout>

  );
};

export default App;
