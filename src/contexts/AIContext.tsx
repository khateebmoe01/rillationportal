import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { useFilters } from './FilterContext'
import { useLocation } from 'react-router-dom'
import type { FirmographicInsightsData } from '../hooks/useFirmographicInsights'
import type { IterationLogEntry } from '../hooks/useIterationLog'

// Types for chart context
export interface ChartContext {
  chartType: string
  chartTitle: string
  data: any
  clickedDataPoint?: any
}

// Full data context for Claude
interface AIDataContext {
  recentMeetings: any[]
  replyBreakdown: {
    positive: number
    interested: number
    not_interested: number
    out_of_office: number
    other: number
  }
}

// Screenshot capture context
export interface ScreenshotContext {
  id: string
  dataUrl: string
  elementInfo: string
  timestamp: Date
}

// Full context sent to Claude
export interface AIFullContext {
  filters: {
    client: string | null
    datePreset: string
    dateRange: {
      start: string
      end: string
    }
  }
  currentScreen: string
  screenName: string
  chartContext: ChartContext | null
  firmographicData: FirmographicInsightsData | null
  dashboardData: AIDataContext | null
  screenshots: ScreenshotContext[]
  iterationLogs: IterationLogEntry[]
}

interface AIContextType {
  // Current screen context
  currentScreen: string
  
  // Active chart context (when user clicks a chart)
  chartContext: ChartContext | null
  setChartContext: (ctx: ChartContext | null) => void
  
  // Firmographic data for deep insights
  firmographicData: FirmographicInsightsData | null
  setFirmographicData: (data: FirmographicInsightsData | null) => void
  
  // Dashboard data
  dashboardData: AIDataContext | null
  
  // Iteration logs for AI context
  iterationLogs: IterationLogEntry[]
  setIterationLogs: (logs: IterationLogEntry[]) => void
  
  // Screenshot context
  screenshots: ScreenshotContext[]
  addScreenshot: (dataUrl: string, elementInfo: string) => void
  removeScreenshot: (id: string) => void
  clearScreenshots: () => void
  
  // Build full context for Claude
  buildContext: () => AIFullContext
  
  // Ask AI with full context
  askWithContext: (question: string) => Promise<string>
  
  // Convenience: ask about a specific chart
  askAboutChart: (chart: ChartContext, question?: string) => void
  
  // Loading state
  isAsking: boolean
  isLoadingData: boolean
  
  // Error state
  error: string | null
  clearError: () => void
  
  // Panel state
  isPanelOpen: boolean
  setIsPanelOpen: (open: boolean) => void
  togglePanel: () => void
  
  // Pre-populated question (from chart click)
  pendingQuestion: string | null
  setPendingQuestion: (q: string | null) => void
  
  // Refresh dashboard data
  refreshDashboardData: () => Promise<void>
  
  // Element picker state
  isElementPickerActive: boolean
  setElementPickerActive: (active: boolean) => void
  
  // Panel dimensions
  panelWidth: number
  setPanelWidth: (width: number) => void
}

const AIContext = createContext<AIContextType | undefined>(undefined)

// Screen name mapping for better context
const SCREEN_NAMES: Record<string, string> = {
  '/crm': 'CRM Dashboard',
  '/deep-insights': 'Deep Insights',
  '/insights': 'Deep Insights',
}

function getScreenName(pathname: string): string {
  return SCREEN_NAMES[pathname] || 'Dashboard'
}

export function AIProvider({ children }: { children: ReactNode }) {
  const { selectedClient, dateRange, datePreset } = useFilters()
  const location = useLocation()
  
  const [chartContext, setChartContext] = useState<ChartContext | null>(null)
  const [firmographicData, setFirmographicData] = useState<FirmographicInsightsData | null>(null)
  const [dashboardData] = useState<AIDataContext | null>(null)
  const [iterationLogs, setIterationLogs] = useState<IterationLogEntry[]>([])
  const [screenshots, setScreenshots] = useState<ScreenshotContext[]>([])
  const [isAsking, setIsAsking] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null)
  const [isElementPickerActive, setElementPickerActive] = useState(false)
  const [panelWidth, setPanelWidth] = useState(620)

  // Screenshot management
  const addScreenshot = useCallback((dataUrl: string, elementInfo: string) => {
    const newScreenshot: ScreenshotContext = {
      id: Date.now().toString(),
      dataUrl,
      elementInfo,
      timestamp: new Date(),
    }
    setScreenshots(prev => {
      const updated = [...prev, newScreenshot]
      return updated.slice(-5)
    })
    setElementPickerActive(false)
  }, [])

  const removeScreenshot = useCallback((id: string) => {
    setScreenshots(prev => prev.filter(s => s.id !== id))
  }, [])

  const clearScreenshots = useCallback(() => {
    setScreenshots([])
  }, [])

  // Clear chart context when navigating
  useEffect(() => {
    setChartContext(null)
  }, [location.pathname])

  // Build the full context object for Claude
  const buildContext = useCallback((): AIFullContext => {
    return {
      filters: {
        client: selectedClient || null,
        datePreset,
        dateRange: {
          start: dateRange.start.toISOString(),
          end: dateRange.end.toISOString(),
        },
      },
      currentScreen: location.pathname,
      screenName: getScreenName(location.pathname),
      chartContext,
      firmographicData,
      dashboardData,
      screenshots,
      iterationLogs,
    }
  }, [selectedClient, dateRange, datePreset, location.pathname, chartContext, firmographicData, dashboardData, screenshots, iterationLogs])

  const askWithContext = useCallback(async (question: string): Promise<string> => {
    setIsAsking(true)
    setError(null)
    
    try {
      const context = buildContext()
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing')
      }
      
      const response = await fetch(`${supabaseUrl}/functions/v1/ai-ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          question,
          context,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Request failed with status ${response.status}`)
      }
      
      const data = await response.json()
      return data.response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      console.error('AI Error:', err)
      setError(errorMessage)
      return `Sorry, I couldn't process that request. ${errorMessage}`
    } finally {
      setIsAsking(false)
    }
  }, [buildContext])

  const askAboutChart = useCallback((chart: ChartContext, question?: string) => {
    setChartContext(chart)
    
    const autoQuestion = question || (
      chart.clickedDataPoint
        ? `Tell me about "${chart.clickedDataPoint.campaign_name || chart.clickedDataPoint.value || chart.clickedDataPoint.name || 'this data point'}" from the "${chart.chartTitle}" chart. What insights can you provide?`
        : `Analyze the "${chart.chartTitle}" chart for me. What are the key insights and recommendations?`
    )
    
    setPendingQuestion(autoQuestion)
    
    if (!isPanelOpen) {
      setIsPanelOpen(true)
    }
  }, [isPanelOpen])

  const togglePanel = useCallback(() => {
    setIsPanelOpen(prev => !prev)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const refreshDashboardData = useCallback(async () => {
    // Simplified - can be expanded if needed
    setIsLoadingData(false)
  }, [])

  return (
    <AIContext.Provider value={{
      currentScreen: location.pathname,
      chartContext,
      setChartContext,
      firmographicData,
      setFirmographicData,
      dashboardData,
      iterationLogs,
      setIterationLogs,
      screenshots,
      addScreenshot,
      removeScreenshot,
      clearScreenshots,
      buildContext,
      askWithContext,
      askAboutChart,
      isAsking,
      isLoadingData,
      error,
      clearError,
      isPanelOpen,
      setIsPanelOpen,
      togglePanel,
      pendingQuestion,
      setPendingQuestion,
      refreshDashboardData,
      isElementPickerActive,
      setElementPickerActive,
      panelWidth,
      setPanelWidth,
    }}>
      {children}
    </AIContext.Provider>
  )
}

export function useAI() {
  const ctx = useContext(AIContext)
  if (!ctx) {
    throw new Error('useAI must be used within an AIProvider')
  }
  return ctx
}
