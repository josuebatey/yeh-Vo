import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function BackButton() {
  const navigate = useNavigate()

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className="mb-4 -ml-2"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back
    </Button>
  )
}