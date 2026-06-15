interface Props {
  children: React.ReactNode
  className?: string
}

export default function GradientText({ children, className = '' }: Props) {
  return (
    <span
      className={className}
      style={{
        background: 'linear-gradient(90deg, #833ab4, #e1306c, #fd1d1d, #fcb045)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {children}
    </span>
  )
}
