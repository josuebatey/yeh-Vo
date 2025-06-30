import React, { useState } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { Button } from '@/components/ui/button'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="h-full flex overflow-hidden border border-red-500 mt-2">
      {/* Fixed Sidebar - Always positioned fixed on desktop */}
      <div className={cn(
        // Mobile: slide in/out overlay
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out",
        // Desktop: always visible, fixed position
        "md:fixed md:z-30",
        // Mobile visibility
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop: always visible
        "md:translate-x-0",
        // Desktop width
        sidebarCollapsed ? "md:w-16" : "md:w-64"
      )}>
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Toggle Button - Positioned at the separator line */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className={cn(
          "fixed top-20 z-40 h-8 w-8 p-0 rounded-full bg-background border shadow-md hover:shadow-lg transition-all duration-200 hidden md:flex items-center justify-center",
          sidebarCollapsed ? "left-14" : "left-60"
        )}
        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {sidebarCollapsed ? (
          <PanelLeftOpen className="h-4 w-4" />
        ) : (
          <PanelLeftClose className="h-4 w-4" />
        )}
      </Button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area - with proper margin for fixed sidebar */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-200",
        // Desktop: add left margin to account for fixed sidebar
        sidebarCollapsed ? "md:ml-16" : "md:ml-64",
        // Mobile: no margin (sidebar is overlay)
        "ml-0"
      )}>
        {/* Sticky Header - Always visible */}
        <div className="sticky top-0 z-30 bg-background">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        </div>
        
        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-auto bg-background">
          <div className="h-full min-h-0 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}