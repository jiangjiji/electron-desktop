import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@renderer/lib/utils'
import { useEffect, useRef, useState } from 'react'
import { DesktopFile } from '~/desktopData'

// 常量定义
const ITEM_WIDTH = 88
const ITEM_HEIGHT = 96
const ITEM_Column_SPACING = 8
const ITEM_ROW_SPACING = 4

function FileIconBase(props: {
  file: DesktopFile
  isSelected: boolean
  isDragging: boolean
  onSelect: (e?: React.MouseEvent) => void
  labelRef: React.RefObject<HTMLSpanElement | null>
}) {
  const fileIconStyle = cn(
    'relative flex h-full w-full cursor-pointer flex-col items-center justify-center rounded p-1 transition-all duration-200',
    props.isSelected
      ? 'border-2 border-blue-500 bg-blue-500/30 shadow-lg'
      : 'border-2 border-transparent hover:bg-white/10',
    props.isDragging ? 'opacity-50' : ''
  )

  const labelStyle = cn(
    'absolute top-[48px] text-center text-xs font-medium break-all',
    props.isSelected ? 'text-blue-100' : 'line-clamp-2 text-white'
  )

  return (
    <div
      className={fileIconStyle}
      onClick={(e) => {
        e.stopPropagation()
        props.onSelect(e)
      }}
    >
      <img src={props.file.icon} alt="icon" className="absolute top-[8px]" />
      <span ref={props.labelRef} className={labelStyle}>
        {props.file.name}
      </span>
    </div>
  )
}

export function FileIcon(props: {
  file: DesktopFile
  index: number
  isSelected?: boolean
  onSelect?: (e?: React.MouseEvent) => void
  containerWidth?: number
  groupId?: string
}) {
  const sortableId = `${props.groupId}-${props.index}`
  const labelRef = useRef<HTMLSpanElement>(null)
  const [labelHeight, setLabelHeight] = useState(0)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortableId,
    data: {
      file: props.file,
      groupId: props.groupId,
      index: props.index
    }
  })

  useEffect(() => {
    if (labelRef.current) {
      const height = labelRef.current.offsetHeight
      setLabelHeight(height)
    }
  }, [])

  useEffect(() => {
    if (labelRef.current) {
      const height = labelRef.current.offsetHeight
      setLabelHeight(height)
    }
  }, [props.isSelected])

  // 计算位置
  const itemsPerRow = props.containerWidth
    ? Math.floor((props.containerWidth - ITEM_Column_SPACING) / (ITEM_WIDTH + ITEM_Column_SPACING))
    : ITEM_ROW_SPACING
  const row = Math.floor(props.index / itemsPerRow)
  const col = props.index % itemsPerRow
  const x = col * (ITEM_WIDTH + ITEM_Column_SPACING) + ITEM_Column_SPACING
  const y = row * ITEM_HEIGHT + ITEM_Column_SPACING

  const style: React.CSSProperties = {
    position: 'absolute',
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging || props.isSelected ? 1000 : 'auto',
    left: x,
    top: y,
    width: ITEM_WIDTH,
    height: 58 + labelHeight
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
      <FileIconBase
        file={props.file}
        isDragging={isDragging}
        isSelected={props.isSelected || false}
        onSelect={props.onSelect || (() => {})}
        labelRef={labelRef}
      />
    </div>
  )
}
