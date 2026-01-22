import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface DropdownContextValue {
  activeDropdownId: string | null
  openDropdown: (id: string) => void
  closeDropdown: (id: string) => void
  closeAll: () => void
}

const DropdownContext = createContext<DropdownContextValue | null>(null)

export function DropdownProvider({ children }: { children: ReactNode }) {
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)

  const openDropdown = useCallback((id: string) => {
    setActiveDropdownId(id)
  }, [])

  const closeDropdown = useCallback((id: string) => {
    setActiveDropdownId(current => current === id ? null : current)
  }, [])

  const closeAll = useCallback(() => {
    setActiveDropdownId(null)
  }, [])

  return (
    <DropdownContext.Provider value={{ activeDropdownId, openDropdown, closeDropdown, closeAll }}>
      {children}
    </DropdownContext.Provider>
  )
}

export function useDropdown(id: string) {
  const context = useContext(DropdownContext)
  
  if (!context) {
    throw new Error('useDropdown must be used within a DropdownProvider')
  }

  const isOpen = context.activeDropdownId === id

  const open = useCallback(() => {
    context.openDropdown(id)
  }, [context, id])

  const close = useCallback(() => {
    context.closeDropdown(id)
  }, [context, id])

  const toggle = useCallback(() => {
    if (isOpen) {
      close()
    } else {
      open()
    }
  }, [isOpen, open, close])

  return { isOpen, open, close, toggle }
}
