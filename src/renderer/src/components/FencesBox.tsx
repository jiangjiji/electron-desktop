import { ScrollArea } from '@/components/ui/scroll-area'
import { rectSortingStrategy, SortableContext } from '@dnd-kit/sortable'
import { useEffect, useRef, useState } from 'react'
import { Rnd } from 'react-rnd'
import { DesktopFile } from '~/desktopData'
import { FileIcon } from './FileIcon'

export interface BoxPosition {
  x: number
  y: number
  width: number
  height: number
}

export interface BoxConfig {
  id: string
  name: string
  files: DesktopFile[]
  position: BoxPosition
}

export function FencesBox(props: {
  boxConfig: BoxConfig
  onBoxChange: (id: string, position: BoxPosition) => BoxPosition
  onBoxStop: () => void
}) {
  const { boxConfig } = props
  const rndRef = useRef<Rnd>(null)
  const [selectedFiles, setSelectedFiles] = useState<DesktopFile[]>([])

  useEffect(() => {
    rndRef.current?.updatePosition({ x: boxConfig.position.x, y: boxConfig.position.y })
    rndRef.current?.updateSize({
      width: boxConfig.position.width,
      height: boxConfig.position.height
    })
  }, [boxConfig.position])

  const handleFileSelect = (file: DesktopFile, isCtrlPressed: boolean) => {
    setSelectedFiles((prev) => {
      const newSelected: DesktopFile[] = []

      if (isCtrlPressed) {
        newSelected.push(...prev)
        // Ctrl+点击：切换选中状态
        if (!newSelected.includes(file)) {
          newSelected.push(file)
        }
      } else {
        // 普通点击：清除其他选中，只选中当前文件
        newSelected.push(file)
      }

      return newSelected
    })
  }

  const handleBoxClick = () => {
    // 点击空白区域时清除所有选中
    setSelectedFiles([])
  }

  return (
    <Rnd
      ref={rndRef}
      size={{ width: boxConfig.position.width, height: boxConfig.position.height }}
      position={{ x: boxConfig.position.x, y: boxConfig.position.y }}
      minWidth={200}
      minHeight={120}
      bounds="window"
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true
      }}
      dragHandleClassName="fencesbox-drag-handle"
      onDrag={(e, data) => {
        const newPosition = { ...boxConfig.position, x: data.x, y: data.y }
        boxConfig.position = props.onBoxChange(boxConfig.id, newPosition)
      }}
      onResize={(e, dirction, elementRef, delta, position) => {
        const newPosition = {
          ...position,
          width: elementRef.offsetWidth,
          height: elementRef.offsetHeight
        }

        boxConfig.position = props.onBoxChange(boxConfig.id, newPosition)
      }}
      onDragStop={props.onBoxStop}
      onResizeStop={props.onBoxStop}
    >
      <div
        className="flex h-full flex-col overflow-hidden rounded-xl bg-black/15 shadow backdrop-blur-lg"
        onClick={handleBoxClick}
      >
        <div className="fencesbox-drag-handle flex cursor-move items-center justify-center bg-black/30 p-2 font-bold text-white select-none">
          {boxConfig.name}
        </div>

        <ScrollArea className="flex-grow overflow-auto">
          <SortableContext
            items={boxConfig.files.flatMap((_, index) => `${boxConfig.id}-${index}`)}
            strategy={rectSortingStrategy}
          >
            {boxConfig.files.map((file, idx) => (
              <FileIcon
                key={file.path}
                file={file}
                index={idx}
                isSelected={selectedFiles.includes(file)}
                containerWidth={boxConfig.position.width}
                groupId={boxConfig.id}
                onSelect={(e) => {
                  // 检测是否按下了 Ctrl 键
                  const isCtrlPressed = e?.ctrlKey || false
                  handleFileSelect(file, isCtrlPressed)
                }}
              />
            ))}
          </SortableContext>
        </ScrollArea>
      </div>
    </Rnd>
  )
}
