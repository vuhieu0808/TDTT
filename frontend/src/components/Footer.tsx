import { useNavigate } from "react-router";

import Stack from "@mui/joy/Stack"
import Link from "@mui/joy/Link"
import Typography from "@mui/joy/Typography"
import Tooltip from '@mui/joy/Tooltip'

function Footer() {
    return (<>
        <Stack
            direction="column"
            spacing={2}
        >
            {/* Links Section */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1, sm: 2, md: 4 }}
                alignItems='center'
                justifyContent='center'
                sx={{
                    minHeight: 'fit-content',
                    padding: '1rem 0',
                }}
            >
                <Tooltip
                    title="Learn more about our team and our vision"
                    arrow
                    placement="top-end"
                    sx={{
                        backgroundColor: '#a855f7',
                        color: 'white',
                        fontSize: '0.875rem',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
                        '& .MuiTooltip-arrow': {
                            color: '#a855f7',
                        },
                    }}
                >
                    <Link
                        href="#"
                        underline="hover"
                    >
                        About Us
                    </Link>
                </Tooltip>
                <Tooltip
                    arrow
                    placement="top-end"
                    title="Reports problems"
                    sx={{
                        backgroundColor: '#a855f7',
                        color: 'white',
                        fontSize: '0.875rem',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
                        '& .MuiTooltip-arrow': {
                            color: '#a855f7',
                        },
                    }}
                >
                    <Link
                        href="#"
                        underline="hover"
                        title="Report problems"
                    >
                        Report
                    </Link>
                </Tooltip>
            </Stack >

            {/* Copyright Section */}

            <Typography
                justifyContent='center'
                textAlign='center'
                sx={{
                    paddingBottom: "1rem",
                }}
            >
                Developed by <b>Lorem_Ipsum</b>
            </Typography>
        </Stack>
    </>)
}

export default Footer;