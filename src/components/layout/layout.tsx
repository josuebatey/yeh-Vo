import React, { useState } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Fixed Sidebar - Always positioned fixed on desktop */}
      <div className={cn(
        // Mobile: slide in/out overlay
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out",
        // Desktop: always visible, fixed position
        "md:fixed md:z-40",
        // Mobile visibility
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        // Desktop width
        sidebarCollapsed ? "md:w-16" : "md:w-64"
      )}>
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area - with proper margin for fixed sidebar */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 overflow-hidden",
        // Desktop: add left margin to account for fixed sidebar
        sidebarCollapsed ? "md:ml-16" : "md:ml-64",
        // Mobile: no margin (sidebar is overlay)
        "ml-0"
      )}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto bg-background">
          <div className="h-full min-h-0 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}