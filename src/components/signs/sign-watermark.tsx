type SignWatermarkProps = {
  className?: string
}

export function SignWatermark({ className = '' }: SignWatermarkProps) {
  return <span className={`sign-watermark ${className}`.trim()}>NO KINGS PROTEST SIGNS</span>
}
