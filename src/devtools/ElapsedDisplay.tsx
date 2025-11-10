import React from 'react'
import Typography from '@mui/material/Typography'

export interface ElapsedDisplayProps {
    // If provided, displays final duration; otherwise shows live elapsed if provided
    finalMs?: number | null
    elapsedMs?: number
    running?: boolean
}

export default function ElapsedDisplay({ finalMs, elapsedMs = 0, running = false }: ElapsedDisplayProps) {
    let text: string
    if (finalMs != null) {
        text = `⏱ ${(finalMs / 1000).toFixed(1)}s`
    } else if (running) {
        text = `⏱ ${(elapsedMs / 1000).toFixed(1)}s`
    } else {
        text = '⏱ 0.0s'
    }
    return (
        <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
            {text}
        </Typography>
    )
}
