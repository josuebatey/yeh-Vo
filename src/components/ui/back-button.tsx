import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function BackButton() {
  const navigate = useNavigate()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate(-1)}
      className="mb-2 p-1 h-8 w-8 hover:bg-accent rounded-full"
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  )
}