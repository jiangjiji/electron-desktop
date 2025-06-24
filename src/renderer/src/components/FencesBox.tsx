import { useEffect, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { DesktopFile } from '~/desktopData'

export interface Group {
  id: string
  name: string
  files: DesktopFile[]
}

const ItemType = {
  FILE: 'file'
}

function FileIcon({ file }: { file: DesktopFile }) {
  const fileIcon = file.icon
    ? file.icon
    : file.isDirectory
      ? '📁'
      : file.ext === 'lnk'
        ? '🔗'
        : '📄'

  return (
    <div className="flex w-20 cursor-pointer flex-col items-center select-none">
      <img src={fileIcon} alt="icon" className="mb-1 h-10 w-10" />
      <div className="max-w-16 text-center text-xs break-all">{file.name}</div>
    </div>
  )
}

function DraggableFileIcon(props: {
  file: DesktopFile
  index: number
  moveFile: (from: number, to: number) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemType.FILE,
      item: { index: props.index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging()
      })
    }),
    [props.index]
  )

  const [, drop] = useDrop({
    accept: ItemType.FILE,
    hover: (item: { index: number }) => {
      if (item.index !== props.index) {
        props.moveFile(item.index, props.index)
        item.index = props.index
      }
    }
  })

  useEffect(() => {
    if (ref.current) {
      drag(drop(ref.current))
    }
  }, [ref, drag, drop])

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <FileIcon file={props.file} />
    </div>
  )
}

export function FencesBox(props: { group: Group; moveFile: (from: number, to: number) => void }) {
  return (
    <div className="m-4 h-[220px] w-[380px] rounded-xl border border-gray-200 bg-white/80 p-4 shadow">
      <div className="mb-2 font-bold">{props.group.name}</div>
      <div className="flex flex-wrap gap-2">
        {props.group.files.map((file, idx) => (
          <DraggableFileIcon key={file.path} file={file} index={idx} moveFile={props.moveFile} />
        ))}
      </div>
    </div>
  )
}
