import { useEffect, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { DesktopFile } from '~/desktopData'

const ItemType = {
  FILE: 'file'
}

function FileIconBase({ file }: { file: DesktopFile }) {
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

export function FileIcon(props: {
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
      <FileIconBase file={props.file} />
    </div>
  )
}
