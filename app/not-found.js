'use client'

import { Box, Typography, Button } from '@mui/material'

const NotFound = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Typography variant="h1" sx={{ fontWeight: 'bold', mb: 4 }}>
        404
      </Typography>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Page Not Found
      </Typography>
      <Button variant="contained" color="primary" href="/">
        Go Back Home
      </Button>
    </Box>
  )
}

export default NotFound
