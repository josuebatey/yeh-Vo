import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function BackButton() {
  const navigate = useNavigate()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate(-1)}
      className="mb-4 p-2 h-8 w-8 rounded-full hover:bg-accent"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Go back</span>
    </Button>
  )
}