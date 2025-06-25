import { ScrollArea } from '@/components/ui/scroll-area'
import { useEffect, useRef } from 'react'
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
  moveFile: (from: number, to: number) => void
  onBoxChange: (id: string, position: BoxPosition) => BoxPosition
  onBoxStop: () => void
}) {
  const { boxConfig } = props
  const rndRef = useRef<Rnd>(null)

  useEffect(() => {
    rndRef.current?.updatePosition({ x: boxConfig.position.x, y: boxConfig.position.y })
    rndRef.current?.updateSize({ width: boxConfig.position.width, height: boxConfig.position.height })
  }, [boxConfig.position])

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
      <div className="flex h-full flex-col overflow-hidden rounded-xl bg-black/15 shadow backdrop-blur-lg">
        <div className="fencesbox-drag-handle flex cursor-move items-center justify-center bg-black/30 p-2 font-bold text-white select-none">
          {boxConfig.name}
        </div>
        <ScrollArea className="flex-grow overflow-auto">
          <div className="flex h-full flex-wrap gap-2">
            {boxConfig.files.map((file, idx) => (
              <FileIcon key={file.path} file={file} index={idx} moveFile={props.moveFile} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </Rnd>
  )
}
