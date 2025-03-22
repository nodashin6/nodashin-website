import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

export const AppLayout = ({ children }) => {
  return (
    <div>
        <PrintStyles />
        <Box className="slide-area" width="100%">
           {children}
        </Box>
    </div>
  );
};


const PrintStyles = () => (
    <style>
        {`
            @media print {
                body * {
                    visibility: hidden;
                }
                .slide-area, .slide-area * {
                    visibility: visible;
                }
                .slide-area {
                    display: block;
                    position: absolute;
                    top: 0;
                    left: 0;
                    z-index: 1000;
                }
                .slide {
                    margin: 0;
                    float: left;
                    width: 100%;
                    break-inside: avoid;
                    page-break-inside: avoid;
                }
                html, body {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    height: 100%;
                }
            }
            .slide h2 {
                font-size: 2.5em;
                background-color: var(--ifm-background-color-400);
                border-bottom: 1px solid var(--ifm-color-emphasis-100);
                margin: 0rem;
                padding-top: 1rem;
                padding-left: 2rem;
                padding-right: 2rem;
            }
            .slide h3 {
                font-size: 2em;
                margin: 0;
            }
        `}
    </style>
);

export const Slide = ({ title, children }) => {
    return (
        <Box
            className="slide"
            width="297mm"
            height="210mm"
            sx={{
                mb: 2,
                boxShadow: '0 0 10px rgba(122, 122, 122, 0.5)',
            }}
        >
            <Stack height="100%">
                <Typography variant="h2">{title}</Typography>
                <SlideContentBackground>
                    <SlideContent>{children}</SlideContent>
                </SlideContentBackground>
            </Stack>
            <div style={{ pageBreakAfter: 'always' }}></div>
        </Box>
    );
};

const SlideContentBackground = ({ children }) => {
    return (
        <Box
            className="slide-content"
            sx={{
                m: 0,
                p: 2,
                width: '100%',
                height: '100%',
                position: 'relative',
                background: 'linear-gradient(160deg, var(--ifm-background-color-500) 0%, var(--ifm-background-color-200) 25%, var(--ifm-background-color-900) 100%)',
            }}
        >
            {children}
        </Box>
    );
}

const SlideContent = ({ children }) => {
    return (
        <Box
            className="slide-content"
            sx={{
                m: 0,
                p: 2,
                width: '100%',
                height: '100%',
                position: 'relative',
            }}
        >
            {children}
        </Box>
    );
};
