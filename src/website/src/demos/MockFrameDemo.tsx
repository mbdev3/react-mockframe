import { useState, useMemo, useRef, useEffect, useCallback, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { MockFrame, DeviceNames, DeviceOptions } from 'react-mockframe'
import type { DeviceName } from 'react-mockframe'
import { Smartphone, Upload, Download, RotateCcw, ZoomIn, Move, Globe, Image as ImageIcon, Palette, Sparkles, Eye, EyeOff, ChevronDown, Check } from 'lucide-react'
import iosScreenshot from '../assets/ios.webp'
import androidScreenshot from '../assets/android.webp'
import ipadScreenshot from '../assets/ipad-pro.webp'
import macosScreenshot from '../assets/macos.webp'
import { toPng } from 'html-to-image'

const colorMap: Record<string, string> = {
  'black': '#2c2b2c',
  'white': '#fafaf7',
  'gold': '#f1e2d0',
  'silver': '#c0c0c0',
  'rosegold': '#e8b4b8',
  'pink': '#ffc0cb',
  'blue': '#33a2db',
  'red': '#f96b6c',
  'green': '#97e563',
  'yellow': '#f2dc60',
  'mist-blue': '#a8bac8',
  'sage': '#a5b8a1',
  'lavender': '#c5b5d2',
  'cosmic-orange': '#F6823D',
  'deep-blue': '#4A547F',
  'space-gray': '#3a3a3a',
  // Pixel 10 colors
  'obsidian': '#1a1a1a',
  'porcelain': '#e8e5e1',
  'mint': '#afdbc5',
  'rose': '#e8c4c4',
  // Galaxy S25 colors
  'phantom-black': '#1e1e1e',
  'icy-blue': '#c5d5e0',
  'navy': '#1a2a40',
}

function getColorHex(color: string): string {
  return colorMap[color.toLowerCase()] || '#888888'
}

// Custom Select Component
interface SelectOption {
  value: string
  label: string
}

function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
}: {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Calculate dropdown position and scroll to selected item
  useLayoutEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      })

      // Scroll to selected item after dropdown renders
      requestAnimationFrame(() => {
        if (dropdownRef.current) {
          const selectedItem = dropdownRef.current.querySelector('[data-selected="true"]')
          if (selectedItem) {
            selectedItem.scrollIntoView({ block: 'center' })
          }
        }
      })
    }
  }, [isOpen])

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Close on scroll (but not when scrolling inside dropdown)
  useEffect(() => {
    if (!isOpen) return

    const handleScroll = (event: Event) => {
      if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) {
        return // Don't close if scrolling inside dropdown
      }
      setIsOpen(false)
    }
    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [isOpen])

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all text-left"
        style={{
          background: 'var(--color-bg-tertiary)',
          border: isOpen ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
          boxShadow: isOpen ? '0 0 0 3px var(--color-accent-subtle)' : 'none',
        }}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <ChevronDown
          className="w-4 h-4 transition-transform"
          style={{
            color: 'var(--color-text-tertiary)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="py-1 rounded-xl overflow-hidden"
          style={{
            position: 'fixed',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 10px 40px var(--color-shadow)',
            backdropFilter: 'blur(20px)',
            maxHeight: '280px',
            overflowY: 'auto',
            zIndex: 99999,
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              data-selected={value === option.value}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left"
              style={{
                background: value === option.value ? 'var(--color-accent-subtle)' : 'transparent',
                color: value === option.value ? 'var(--color-accent)' : 'var(--color-text-primary)',
              }}
              onMouseEnter={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.background = 'var(--color-bg-tertiary)'
                }
              }}
              onMouseLeave={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <span className="font-medium">{option.label}</span>
              {value === option.value && (
                <Check className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
              )}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}

// Uploaded image content with drag-to-pan functionality
function UploadedImageContent({
  src,
  zoom,
  position,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  isDragging,
  background,
}: {
  src: string
  zoom: number
  position: { x: number; y: number }
  onMouseDown: (e: React.MouseEvent) => void
  onMouseMove: (e: React.MouseEvent) => void
  onMouseUp: () => void
  isDragging: boolean
  background: string
}) {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        overflow: 'hidden',
        background,
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <img
        src={src}
        alt="Uploaded"
        draggable={false}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
          transformOrigin: 'center',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
    </div>
  )
}

// Get appropriate screenshot for device
function getDeviceScreenshot(device: string): string {
  const lowerDevice = device.toLowerCase()

  // MacBooks
  if (lowerDevice.includes('macbook')) {
    return macosScreenshot
  }

  // iPads
  if (lowerDevice.includes('ipad')) {
    return ipadScreenshot
  }

  // Android devices
  const androidDevices = ['pixel', 'galaxy', 'nexus', 'samsung', 'lumia']
  if (androidDevices.some(d => lowerDevice.includes(d))) {
    return androidScreenshot
  }

  // Default to iOS (iPhones)
  return iosScreenshot
}

// Mock app screen with real screenshots
function MockAppScreen({ device, landscape, deviceWidth, deviceHeight }: {
  device: string
  landscape?: boolean
  deviceWidth?: number
  deviceHeight?: number
}) {
  const screenshot = getDeviceScreenshot(device)

  if (landscape && deviceWidth && deviceHeight) {
    // In landscape mode, we create a rotated container that matches portrait dimensions,
    // then rotate the whole thing. This ensures object-fit: cover works correctly.
    return (
      <div
        className="w-full h-full overflow-hidden flex items-center justify-center"
      >
        <div
          style={{
            width: deviceWidth,
            height: deviceHeight,
            transform: 'rotate(-90deg)',
            transformOrigin: 'center center',
          }}
        >
          <img
            src={screenshot}
            alt={`${device} screenshot`}
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <img
      src={screenshot}
      alt={`${device} screenshot`}
      className="w-full h-full object-cover"
      draggable={false}
    />
  )
}

// Devices that have a notch or dynamic island
const devicesWithNotch: DeviceName[] = ['iPhone X', 'iPhone 17', 'MacBook Pro']

export default function MockFrameDemo() {
  const [device, setDevice] = useState<DeviceName>('iPhone X')
  const [landscape, setLandscape] = useState(false)
  const [hideNotch, setHideNotch] = useState(false)
  const deviceInfo = DeviceOptions[device]
  const colors = deviceInfo.colors
  const [color, setColor] = useState(colors[0])
  const [previewUrl, setPreviewUrl] = useState('')
  const [activeUrl, setActiveUrl] = useState('')
  const [contentMode, setContentMode] = useState<'demo' | 'url' | 'upload'>('demo')
  const [copied, setCopied] = useState(false)

  // Check if current device has a notch
  const deviceHasNotch = devicesWithNotch.includes(device)

  // Image upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imageZoom, setImageZoom] = useState(1)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isDropZoneActive, setIsDropZoneActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const deviceRef = useRef<HTMLDivElement>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  // Background options for uploaded images
  const [bgType, setBgType] = useState<'solid' | 'gradient'>('solid')
  const [bgColor, setBgColor] = useState('#000000')
  const [bgGradient, setBgGradient] = useState('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')

  // Preset gradients
  const gradientPresets = [
    { name: 'Purple', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'Sunset', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { name: 'Ocean', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { name: 'Forest', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
    { name: 'Night', value: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 100%)' },
    { name: 'Warm', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  ]

  // Device zoom (for the frame itself)
  const [deviceZoom, setDeviceZoom] = useState<number | 'auto'>('auto')
  const [autoZoomValue, setAutoZoomValue] = useState(0.75)
  const zoomPresets = [
    { value: 'auto' as const, label: 'Auto' },
    { value: 0.5, label: '50%' },
    { value: 0.75, label: '75%' },
    { value: 1, label: '100%' },
  ]

  // Calculate auto-fit zoom based on container and device dimensions
  const calculateAutoZoom = useCallback(() => {
    if (!previewContainerRef.current) return 0.75

    const container = previewContainerRef.current
    const containerWidth = container.clientWidth - 200 // Padding for sides
    const containerHeight = container.clientHeight - 100 // Padding for top/bottom

    // Get device dimensions (including frame chrome - roughly 20-30% extra)
    const deviceWidth = landscape ? (deviceInfo.height || 812) : (deviceInfo.width || 375)
    const deviceHeight = landscape ? (deviceInfo.width || 375) : (deviceInfo.height || 812)

    // Device frames add significant chrome, estimate ~1.3x for phones, ~1.15x for laptops
    const isLaptop = device.toLowerCase().includes('macbook')
    const chromeMultiplier = isLaptop ? 1.15 : 1.35

    const effectiveWidth = deviceWidth * chromeMultiplier
    const effectiveHeight = deviceHeight * chromeMultiplier

    // Calculate zoom to fit both dimensions
    const zoomToFitWidth = containerWidth / effectiveWidth
    const zoomToFitHeight = containerHeight / effectiveHeight

    // Use the smaller zoom to ensure it fits both ways
    const optimalZoom = Math.min(zoomToFitWidth, zoomToFitHeight)

    // Clamp between 0.25 and 1.5
    return Math.max(0.25, Math.min(1.5, optimalZoom))
  }, [deviceInfo.width, deviceInfo.height, landscape, device])

  // Update auto zoom when container or device changes
  useEffect(() => {
    if (deviceZoom !== 'auto') return

    const updateAutoZoom = () => {
      const newZoom = calculateAutoZoom()
      setAutoZoomValue(newZoom)
    }

    updateAutoZoom()

    // Use ResizeObserver to track container size changes
    const container = previewContainerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver(updateAutoZoom)
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [deviceZoom, calculateAutoZoom])

  // Get effective zoom value
  const effectiveZoom = deviceZoom === 'auto' ? autoZoomValue : deviceZoom

  // Export state
  const [exportFormat, setExportFormat] = useState<'png' | 'webp'>('png')
  const [isExporting, setIsExporting] = useState(false)

  const codeSnippet = useMemo(() => {
    const props: string[] = [`device="${device}"`]
    if (colors.length > 0 && color) {
      props.push(`color="${color}"`)
    }
    if (deviceInfo.hasLandscape && landscape) {
      props.push('landscape')
    }
    if (deviceHasNotch && hideNotch) {
      props.push('hideNotch')
    }
    return `<MockFrame
  ${props.join('\n  ')}
>
  <YourAppContent />
</MockFrame>`
  }, [device, color, colors.length, landscape, deviceInfo.hasLandscape, deviceHasNotch, hideNotch])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeSnippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLoadUrl = () => {
    if (previewUrl) {
      let url = previewUrl.trim()
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }
      setActiveUrl(url)
      setContentMode('url')
    }
  }

  // Helper to process uploaded file
  const processImageFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
        setContentMode('upload')
        setImageZoom(1)
        setImagePosition({ x: 0, y: 0 })
      }
      reader.readAsDataURL(file)
    }
  }

  // Image upload handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processImageFile(file)
  }

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDropZoneActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDropZoneActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDropZoneActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) processImageFile(file)
  }

  const handleClearImage = () => {
    setUploadedImage(null)
    setContentMode('demo')
    setImageZoom(1)
    setImagePosition({ x: 0, y: 0 })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleResetZoomPan = () => {
    setImageZoom(1)
    setImagePosition({ x: 0, y: 0 })
  }

  // Drag handlers for pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (contentMode !== 'upload') return
    setIsDragging(true)
    setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setImagePosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => setIsDragging(false)

  // Export handler
  const handleExport = async () => {
    if (!deviceRef.current) return
    setIsExporting(true)

    try {
      // Always generate PNG first (supports transparency)
      const pngDataUrl = await toPng(deviceRef.current, { pixelRatio: 2 })

      let finalDataUrl = pngDataUrl
      const finalFormat = exportFormat

      // Convert to WebP if requested (preserves transparency)
      if (exportFormat === 'webp') {
        const img = new Image()
        img.src = pngDataUrl
        await new Promise((resolve) => { img.onload = resolve })

        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          finalDataUrl = canvas.toDataURL('image/webp', 0.95)
        }
      }

      const link = document.createElement('a')
      link.download = `device-mockup-${device.replace(/\s+/g, '-').toLowerCase()}.${finalFormat}`
      link.href = finalDataUrl
      link.click()
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto">
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4"
          style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}
        >
          Core Component
        </span>
        <h1
          className="text-4xl md:text-5xl mb-4 font-serif"
          style={{ color: 'var(--color-text-primary)' }}
        >
          MockFrame
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }} className="text-lg">
          Showcase your app in beautiful, realistic device frames.
          Perfect for portfolios, documentation, and marketing.
        </p>
      </div>

      <div className="flex gap-8 lg:flex-row flex-col">
        {/* Controls Panel */}
        <div className="space-y-4 lg:w-[340px] flex-shrink-0">
          {/* Device Selection */}
          <div className="glass-card p-5">
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Device Model
            </label>
            <CustomSelect
              value={device}
              onChange={(value) => {
                const newDevice = value as DeviceName
                setDevice(newDevice)
                const newColors = DeviceOptions[newDevice].colors
                setColor(newColors[0])
              }}
              options={DeviceNames.map((name) => ({ value: name, label: name }))}
            />
            <div
              className="flex items-center gap-3 mt-3 text-xs"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              <span>{deviceInfo.width} × {deviceInfo.height}</span>
              {deviceInfo.hasLandscape && (
                <span
                  className="px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}
                >
                  Rotatable
                </span>
              )}
            </div>
          </div>

          {/* Color Selection */}
          {colors.length > 0 && (
            <div className="glass-card p-5">
              <label
                className="block text-sm font-medium mb-3"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Color Variant
              </label>
              <div className="flex flex-wrap gap-3">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="group relative"
                  >
                    <span
                      className="block w-10 h-10 rounded-full transition-all"
                      style={{
                        backgroundColor: getColorHex(c),
                        boxShadow: color === c
                          ? '0 0 0 3px var(--color-accent), inset 0 0 0 2px rgba(255,255,255,0.3)'
                          : 'inset 0 0 0 2px rgba(0,0,0,0.1)',
                        transform: color === c ? 'scale(1.1)' : 'scale(1)',
                      }}
                    />
                    <span
                      className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] capitalize opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      {c}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Orientation */}
          {deviceInfo.hasLandscape && (
            <div className="glass-card p-5">
              <label
                className="block text-sm font-medium mb-3"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Orientation
              </label>
              <div className="flex gap-2">
                {[
                  { value: false, label: 'Portrait' },
                  { value: true, label: 'Landscape' },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setLandscape(opt.value)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: landscape === opt.value ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                      color: landscape === opt.value ? 'var(--color-bg-primary)' : 'var(--color-text-secondary)',
                      border: `1px solid ${landscape === opt.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    }}
                  >
                    <Smartphone className="w-4 h-4" style={{ transform: opt.value ? 'rotate(90deg)' : 'none' }} />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notch Toggle */}
          {deviceHasNotch && (
            <div className="glass-card p-5">
              <label
                className="block text-sm font-medium mb-3"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {device === 'iPhone 17' ? 'Dynamic Island' : 'Notch'}
              </label>
              <div className="flex gap-2">
                {[
                  { value: false, label: 'Show', icon: Eye },
                  { value: true, label: 'Hide', icon: EyeOff },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setHideNotch(opt.value)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: hideNotch === opt.value ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                      color: hideNotch === opt.value ? 'var(--color-bg-primary)' : 'var(--color-text-secondary)',
                      border: `1px solid ${hideNotch === opt.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    }}
                  >
                    <opt.icon className="w-4 h-4" />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Zoom */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <label
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Device Scale
              </label>
              {deviceZoom === 'auto' && (
                <span
                  className="text-xs"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  {Math.round(autoZoomValue * 100)}%
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {zoomPresets.map((preset) => (
                <button
                  key={String(preset.value)}
                  onClick={() => setDeviceZoom(preset.value)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: deviceZoom === preset.value ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                    color: deviceZoom === preset.value ? 'var(--color-bg-primary)' : 'var(--color-text-secondary)',
                    border: `1px solid ${deviceZoom === preset.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Screen Content */}
          <div className="glass-card p-5">
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Screen Content
            </label>

            {/* Content Mode Tabs */}
            <div
              className="flex rounded-xl p-1 mb-4"
              style={{ background: 'var(--color-bg-tertiary)' }}
            >
              {[
                { mode: 'demo' as const, icon: Sparkles, label: 'Demo' },
                { mode: 'url' as const, icon: Globe, label: 'URL' },
                { mode: 'upload' as const, icon: ImageIcon, label: 'Screenshot' },
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setContentMode(mode)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: contentMode === mode ? 'var(--color-bg-primary)' : 'transparent',
                    color: contentMode === mode ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                    boxShadow: contentMode === mode ? '0 1px 3px var(--color-shadow)' : 'none',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* URL Mode Controls */}
            {contentMode === 'url' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={previewUrl}
                    onChange={(e) => setPreviewUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLoadUrl()}
                    placeholder="Enter any URL..."
                    className="flex-1 px-3 py-2 rounded-lg text-sm transition-all"
                    style={{
                      background: 'var(--color-bg-tertiary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                  <button
                    onClick={handleLoadUrl}
                    className="btn-accent px-4 py-2 rounded-lg text-sm"
                  >
                    Load
                  </button>
                </div>
                {activeUrl && (
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs truncate flex-1"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      {activeUrl}
                    </span>
                    <button
                      onClick={() => setActiveUrl('')}
                      className="text-xs ml-2 hover:underline"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      Clear
                    </button>
                  </div>
                )}
                <p
                  className="text-xs"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Note: Some sites block iframe embedding
                </p>
              </div>
            )}

            {/* Upload Mode Controls */}
            {contentMode === 'upload' && (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Drag & Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !uploadedImage && fileInputRef.current?.click()}
                  className="relative rounded-xl p-6 text-center transition-all cursor-pointer"
                  style={{
                    border: isDropZoneActive
                      ? '2px dashed var(--color-accent)'
                      : uploadedImage
                        ? '2px solid var(--color-border)'
                        : '2px dashed var(--color-border)',
                    background: isDropZoneActive
                      ? 'var(--color-accent-subtle)'
                      : uploadedImage
                        ? 'var(--color-bg-tertiary)'
                        : 'transparent',
                  }}
                >
                  {uploadedImage ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={uploadedImage}
                        alt="Preview"
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 text-left">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          Image uploaded
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: 'var(--color-text-tertiary)' }}
                        >
                          Drag a new image or click below
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                        style={{
                          background: isDropZoneActive ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                        }}
                      >
                        <Upload
                          className="w-5 h-5"
                          style={{
                            color: isDropZoneActive ? 'var(--color-bg-primary)' : 'var(--color-text-tertiary)',
                          }}
                        />
                      </div>
                      <p
                        className="text-sm font-medium mb-1"
                        style={{ color: isDropZoneActive ? 'var(--color-accent)' : 'var(--color-text-primary)' }}
                      >
                        {isDropZoneActive ? 'Drop image here' : 'Drag & drop an image'}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        or click to browse
                      </p>
                    </>
                  )}
                </div>

                {/* Action Buttons (when image uploaded) */}
                {uploadedImage && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: 'var(--color-accent-subtle)',
                        border: '1px solid var(--color-accent)',
                        color: 'var(--color-accent)',
                      }}
                    >
                      <Upload className="w-4 h-4" />
                      Change Image
                    </button>
                    <button
                      onClick={handleClearImage}
                      className="px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: 'var(--color-bg-tertiary)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      Clear
                    </button>
                  </div>
                )}

                {/* Image Controls */}
                {uploadedImage && (
                  <>
                    {/* Background Options */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                          Background
                        </span>
                      </div>

                      {/* Background Type Toggle */}
                      <div
                        className="flex rounded-lg p-1"
                        style={{ background: 'var(--color-bg-tertiary)' }}
                      >
                        {[
                          { type: 'solid' as const, label: 'Solid' },
                          { type: 'gradient' as const, label: 'Gradient' },
                        ].map(({ type, label }) => (
                          <button
                            key={type}
                            onClick={() => setBgType(type)}
                            className="flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                            style={{
                              background: bgType === type ? 'var(--color-bg-primary)' : 'transparent',
                              color: bgType === type ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* Solid Color Picker */}
                      {bgType === 'solid' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0"
                            style={{ background: 'transparent' }}
                          />
                          <div className="flex gap-1.5 flex-wrap">
                            {['#000000', '#ffffff', '#1a1a2e', '#f5f5f5', '#0f172a', '#fef3c7'].map((c) => (
                              <button
                                key={c}
                                onClick={() => setBgColor(c)}
                                className="w-6 h-6 rounded-md transition-transform hover:scale-110"
                                style={{
                                  background: c,
                                  boxShadow: bgColor === c
                                    ? '0 0 0 2px var(--color-accent)'
                                    : 'inset 0 0 0 1px rgba(128,128,128,0.3)',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Gradient Presets */}
                      {bgType === 'gradient' && (
                        <div className="flex gap-1.5 flex-wrap">
                          {gradientPresets.map((preset) => (
                            <button
                              key={preset.name}
                              onClick={() => setBgGradient(preset.value)}
                              title={preset.name}
                              className="w-8 h-8 rounded-lg transition-transform hover:scale-110"
                              style={{
                                background: preset.value,
                                boxShadow: bgGradient === preset.value
                                  ? '0 0 0 2px var(--color-accent)'
                                  : 'none',
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Zoom Control */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ZoomIn className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                          <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                            Zoom
                          </span>
                        </div>
                        <button
                          onClick={handleResetZoomPan}
                          className="flex items-center gap-1 text-xs"
                          style={{ color: 'var(--color-accent)' }}
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reset
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0.5"
                          max="3"
                          step="0.1"
                          value={imageZoom}
                          onChange={(e) => setImageZoom(parseFloat(e.target.value))}
                          className="flex-1"
                          style={{ accentColor: 'var(--color-accent)' }}
                        />
                        <span
                          className="text-xs font-medium w-10 text-right"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {imageZoom.toFixed(1)}x
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-2 text-xs"
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        <Move className="w-3 h-3" />
                        <span>Drag the image to reposition</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Demo Mode - just a hint */}
            {contentMode === 'demo' && (
              <p
                className="text-xs"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Showing a sample app interface
              </p>
            )}
          </div>

          {/* Export */}
          <div className="glass-card p-5">
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Export Mockup
            </label>

            {/* Warning for URL mode */}
            {contentMode === 'url' && activeUrl && (
              <div
                className="mb-3 px-3 py-2 rounded-lg text-xs"
                style={{
                  background: 'rgba(234, 179, 8, 0.1)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <strong>Note:</strong> URL content cannot be captured due to browser security. Use the Screenshot tab to upload a screenshot of the website instead.
              </div>
            )}

            <div className="flex gap-2">
              <div className="w-24">
                <CustomSelect
                  value={exportFormat}
                  onChange={(value) => setExportFormat(value as 'png' | 'webp')}
                  options={[
                    { value: 'png', label: 'PNG' },
                    { value: 'webp', label: 'WebP' },
                  ]}
                />
              </div>
              <button
                onClick={handleExport}
                disabled={isExporting || (contentMode === 'url' && !!activeUrl)}
                className="flex-1 flex items-center justify-center gap-2 btn-accent rounded-lg"
                style={{
                  opacity: isExporting || (contentMode === 'url' && activeUrl) ? 0.5 : 1,
                  cursor: (contentMode === 'url' && activeUrl) ? 'not-allowed' : 'pointer',
                }}
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Download'}
              </button>
            </div>
          </div>

          {/* Code */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <label
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Usage Code
              </label>
              <button
                onClick={handleCopy}
                className="text-xs font-medium transition-colors"
                style={{ color: 'var(--color-accent)' }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="code-block p-4 text-xs overflow-x-auto">
              <code>{codeSnippet}</code>
            </pre>
          </div>
        </div>

        {/* Device Preview */}
        <div className="flex-1 min-w-0">
          <div ref={previewContainerRef} className="device-showcase overflow-auto flex items-center justify-center" style={{ minHeight: '600px' }}>
            <div style={{ padding: '60px', display: 'inline-block' }}>
              <div ref={deviceRef} style={{ display: 'inline-block' }}>
                <MockFrame
                  device={device}
                  {...(colors.length > 0 ? { color } : {})}
                  landscape={deviceInfo.hasLandscape ? landscape : undefined}
                  zoom={effectiveZoom}
                  animated
                  hideNotch={hideNotch}
                >
                  {contentMode === 'upload' && uploadedImage ? (
                    <UploadedImageContent
                      src={uploadedImage}
                      zoom={imageZoom}
                      position={imagePosition}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      isDragging={isDragging}
                      background={bgType === 'gradient' ? bgGradient : bgColor}
                    />
                  ) : contentMode === 'url' && activeUrl ? (
                    <iframe
                      src={activeUrl}
                      className="w-full h-full border-0"
                      style={{ background: '#fff' }}
                      title="Preview"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    <MockAppScreen
                      device={device}
                      landscape={deviceInfo.hasLandscape && landscape}
                      deviceWidth={deviceInfo.width}
                      deviceHeight={deviceInfo.height}
                    />
                  )}
                </MockFrame>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
