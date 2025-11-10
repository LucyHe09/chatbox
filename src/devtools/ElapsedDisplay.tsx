import React from 'react'
import Typography from '@mui/material/Typography'

export interface ElapsedDisplayProps {
    finalMs?: number | null
    elapsedMs?: number
    running?: boolean
}

function formatDuration(ms: number): string {
    const totalSeconds = ms / 1000

    if (totalSeconds < 60) {
        return `${totalSeconds.toFixed(1)}s`
    }

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
