import React from 'react'
import { Box } from '@mui/material';

const Page = () => {
  return (
    <WidthSidebar>
      <Box>
        <h1>20250303</h1>
      </Box>
    </WidthSidebar>
  )
}

export default Page



const WidthSidebar = ({ children }) => {
  return (
    <Box>
      {children}
    </Box>
      
  )
}