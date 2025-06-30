import { motion } from 'framer-motion'

interface BoltBadgeProps {
  variant?: 'white' | 'black' | 'text'
  position?: 'top-right' | 'bottom-right'
  className?: string
}

export function BoltBadge({ 
  variant = 'black', 
  position = 'bottom-right',
  className = '' 
}: BoltBadgeProps) {
  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50'
  }

  const variantStyles = {
    white: {
      background: 'rgba(255, 255, 255, 0.95)',
      color: '#000000',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      shadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    },
    black: {
      background: 'rgba(0, 0, 0, 0.85)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      shadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
    },
    text: {
      background: 'rgba(0, 0, 0, 0.8)',
      color: '#ffffff',
      border: 'none',
      shadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
    }
  }

  const currentStyle = variantStyles[variant]

  return (
    <motion.a
      href="https://bolt.new/"
      target="_blank"
      rel="noopener noreferrer"
      className={`${positionClasses[position]} ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        background: currentStyle.background,
        color: currentStyle.color,
        border: currentStyle.border,
        boxShadow: currentStyle.shadow,
        backdropFilter: 'blur(10px)',
        borderRadius: variant === 'text' ? '6px' : '50px',
        padding: variant === 'text' ? '8px 12px' : '12px 16px',
        fontSize: variant === 'text' ? '12px' : '14px',
        fontWeight: '600',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: variant === 'text' ? '4px' : '8px',
        transition: 'all 0.2s ease',
        userSelect: 'none'
      }}
    >
      {variant !== 'text' && (
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: variant === 'white' 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 'bold',
            color: '#ffffff'
          }}
        >
          ⚡
        </div>
      )}
      <span>
        {variant === 'text' ? '⚡ Built with Bolt.new' : 'Built with Bolt.new'}
      </span>
    </motion.a>
  )
}