import { useEffect, useState, useRef, useCallback } from 'react'

type Subscriber = (state: { running: boolean; elapsedMs: number; finalMs: number | null }) => void

class TimerManager {
    timers: Map<string, { startMs: number; elapsedMs: number; running: boolean; finalMs: number | null }>
    subs: Map<string, Set<Subscriber>>
    interval?: number
    tickMs: number

    constructor(tickMs = 100) {
        this.timers = new Map()
        this.subs = new Map()
        this.tickMs = tickMs
    }

    ensureInterval() {
        if (this.interval) return
        this.interval = window.setInterval(() => this.tick(), this.tickMs)
    }

    clearIntervalIfIdle() {
        const anyRunning = Array.from(this.timers.values()).some(t => t.running)
        if (!anyRunning && this.interval) {
            clearInterval(this.interval)
            this.interval = undefined
        }
    }

    tick() {
        const now = performance.now()
        for (const [id, t] of this.timers.entries()) {
            if (t.running) {
                t.elapsedMs = now - t.startMs
                this.notify(id)
            }
        }
        this.clearIntervalIfIdle()
    }

    notify(id: string) {
        const s = this.subs.get(id)
        const t = this.timers.get(id)
        if (!s || !t) return
        for (const cb of s) cb({ running: t.running, elapsedMs: t.elapsedMs, finalMs: t.finalMs })
    }

    start(id: string) {
        const now = performance.now()
        const existing = this.timers.get(id)
        if (existing) {
            existing.startMs = now - existing.elapsedMs
            existing.running = true
            existing.finalMs = null
        } else {
            this.timers.set(id, { startMs: now, elapsedMs: 0, running: true, finalMs: null })
        }
        this.ensureInterval()
        this.notify(id)
    }

    stop(id: string) {
        const t = this.timers.get(id)
        if (!t) return
        t.running = false
        t.finalMs = t.elapsedMs
        this.notify(id)
        this.clearIntervalIfIdle()
    }

    setFinal(id: string, finalMs: number) {
        const t = this.timers.get(id)
        if (!t) {
            this.timers.set(id, { startMs: performance.now() - finalMs, elapsedMs: finalMs, running: false, finalMs })
        } else {
            t.running = false
            t.elapsedMs = finalMs
            t.finalMs = finalMs
        }
        this.notify(id)
    }

    subscribe(id: string, cb: Subscriber) {
        if (!this.subs.has(id)) this.subs.set(id, new Set())
        this.subs.get(id)!.add(cb)
        if (!this.timers.has(id)) {
            this.timers.set(id, { startMs: performance.now(), elapsedMs: 0, running: false, finalMs: null })
        }
        const t = this.timers.get(id)!
        cb({ running: t.running, elapsedMs: t.elapsedMs, finalMs: t.finalMs })
        return () => {
            this.subs.get(id)!.delete(cb)
            if (this.subs.get(id)!.size === 0) this.subs.delete(id)
        }
    }
}

const manager = new TimerManager(100)

export function startTimerForId(messageId: string) {
    manager.start(messageId)
}
export function stopTimerForId(messageId: string) {
    manager.stop(messageId)
}
export function setFinalTimerForId(messageId: string, ms: number) {
    manager.setFinal(messageId, ms)
}

export function useReasoningTimer(messageId?: string) {
    const [running, setRunning] = useState(false)
    const [elapsedMs, setElapsedMs] = useState(0)
    const [finalMs, setFinalMs] = useState<number | null>(null)
    const idRef = useRef(messageId)

    useEffect(() => {
        idRef.current = messageId
    }, [messageId])

    useEffect(() => {
        if (!messageId) return
        const unsub = manager.subscribe(messageId, (s) => {
            setRunning(s.running)
            setElapsedMs(Math.round(s.elapsedMs))
            setFinalMs(s.finalMs)
        })
        return unsub
    }, [messageId])

    const start = useCallback(() => {
        if (!messageId) return
        manager.start(messageId)
    }, [messageId])

    const stop = useCallback(() => {
        if (!messageId) return
        manager.stop(messageId)
    }, [messageId])

    const setFinal = useCallback((ms: number) => {
        if (!messageId) return
        manager.setFinal(messageId, ms)
    }, [messageId])

    return { running, elapsedMs, finalMs, start, stop, setFinal }
}

export default useReasoningTimer
