import Navbar from '@/components/Navbar.tsx'
import Box from '@mui/joy/Box'
import { type ReactNode } from 'react'

interface LayoutProps {
    children: ReactNode
}

function Layout({ children }: LayoutProps) {
    return (<>
        <Box sx={{ display: 'flex', width: '100%', height: '100vh' }}>
            <Navbar />
            <Box sx={{
                flexGrow: 1,
                padding: 3,
                overflow: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                {children}
            </Box>
        </Box>
    </>)
}

export default Layout;