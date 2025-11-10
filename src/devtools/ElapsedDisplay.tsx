import React from 'react'
import Typography from '@mui/material/Typography'

export interface ElapsedDisplayProps {
    // If provided, displays final duration; otherwise shows live elapsed if provided
    finalMs?: number | null
    elapsedMs?: number
    running?: boolean
}

function formatDuration(ms: number): string {
    const totalSeconds = ms / 1000

    if (totalSeconds < 60) {
        // For durations under 60 seconds, show decimal: "3.2s"
        return `${totalSeconds.toFixed(1)}s`
    }

    // For durations 60 seconds or more, show minutes and seconds: "1m 23s"
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    return `${minutes}m ${seconds}s`
}

export default function ElapsedDisplay({ finalMs, elapsedMs = 0, running = false }: ElapsedDisplayProps) {
    let text: string
    if (finalMs != null) {
        text = `⏱ ${formatDuration(finalMs)}`
    } else if (running) {
        text = `⏱ ${formatDuration(elapsedMs)}`
    } else {
        text = '⏱ 0.0s'
    }
    return (
        <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
            {text}
        </Typography>
    )
}
