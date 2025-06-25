import { BoxPosition, FencesBox, type BoxConfig } from '@/components/FencesBox'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { useEffect, useRef, useState } from 'react'
import { DesktopFile } from '~/desktopData'

// 对齐辅助线的吸附距离
const SNAP_THRESHOLD = 4

// 辅助线类型
interface GuideLine {
  type: 'vertical' | 'horizontal'
  position: number
}

function IconManager({
  children,
  boxConfigs,
  onMoveFile
}: {
  children: React.ReactNode
  boxConfigs: BoxConfig[]
  onMoveFile: (fromGroupId: string, fromIndex: number, toGroupId: string, toIndex: number) => void
}) {
  // 拖拽中的文件
  const [activeFile, setActiveFile] = useState<DesktopFile | null>(null)

  // 配置拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  )

  // 拖拽开始
  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id as string

    // 获取拖拽的文件信息
    const [groupId, index] = activeId.split('-')
    const box = boxConfigs.find((b) => b.id === groupId)
    if (box && box.files[parseInt(index)]) {
      setActiveFile(box.files[parseInt(index)])
    }
  }

  // 拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const activeId = active.id as string
      const overId = over.id as string

      // 解析拖拽项和目标项的信息
      const [activeGroupId, activeIndex] = activeId.split('-')
      const [overGroupId, overIndex] = overId.split('-')

      if (activeGroupId && overGroupId && activeIndex && overIndex) {
        // 执行文件移动操作
        onMoveFile(activeGroupId, parseInt(activeIndex), overGroupId, parseInt(overIndex))
      }
    }

    setActiveFile(null)
  }

  // 拖拽悬停
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const activeId = active.id as string
      const overId = over.id as string

      // 解析拖拽项和目标项的信息
      const [activeGroupId, activeIndex] = activeId.split('-')
      const [overGroupId, overIndex] = overId.split('-')

      if (activeGroupId && overGroupId && activeIndex && overIndex) {
        // 可以在这里添加实时预览逻辑
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      {children}
      <DragOverlay>
        {activeFile ? (
          <div className="flex w-20 cursor-pointer flex-col items-center rounded border-2 border-blue-500 bg-blue-500/30 p-1 shadow-lg">
            <img src={activeFile.icon} alt="icon" className="mb-1 h-8 w-8" />
            <span className="text-center text-xs font-medium break-all text-blue-100">
              {activeFile.name}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

function BoxManager({ boxConfigs }: { boxConfigs: BoxConfig[] }) {
  // 当前辅助线
  const [guideLines, setGuideLines] = useState<GuideLine[]>([])
  // 当前正在拖动/缩放的box id
  const draggingId = useRef<string | null>(null)

  // 计算所有对齐线（含窗口边缘）
  function getAllGuides(currentId: string, currentPosition: BoxPosition) {
    const lines: GuideLine[] = []
    const curEdges = [
      currentPosition.x, // left
      currentPosition.x + currentPosition.width // right
    ]
    const curVEdges = [
      currentPosition.y, // top
      currentPosition.y + currentPosition.height // bottom
    ]

    // box间对齐
    boxConfigs.forEach((box) => {
      if (box.id === currentId) return
      const position = box.position
      const edges = [position.x, position.x + position.width]
      const vEdges = [position.y, position.y + position.height]
      // 横向对齐
      curEdges.forEach((curX) => {
        edges.forEach((x) => {
          if (Math.abs(curX - x) < SNAP_THRESHOLD / 2) {
            lines.push({ type: 'vertical', position: x })
          }
        })
      })
      // 纵向对齐
      curVEdges.forEach((curY) => {
        vEdges.forEach((y) => {
          if (Math.abs(curY - y) < SNAP_THRESHOLD / 2) {
            lines.push({ type: 'horizontal', position: y })
          }
        })
      })
    })

    return lines
  }

  // 计算与窗口边缘的吸附偏移
  function calculateScreenSnap(data: BoxPosition) {
    const { x, y, width, height } = data
    const winWidth = window.innerWidth
    const winHeight = window.innerHeight

    let minXDiff = SNAP_THRESHOLD + 1
    let minYDiff = SNAP_THRESHOLD + 1

    // 水平方向吸附
    const curEdges = [x, x + width]
    const screenEdges = [0, winWidth]
    curEdges.forEach((curX) => {
      screenEdges.forEach((edgeX) => {
        const diff = edgeX - curX
        if (Math.abs(diff) < Math.abs(minXDiff) && Math.abs(diff) < SNAP_THRESHOLD) {
          minXDiff = diff
        }
      })
    })

    // 垂直方向吸附
    const curVEdges = [y, y + height]
    const screenVEdges = [0, winHeight]
    curVEdges.forEach((curY) => {
      screenVEdges.forEach((edgeY) => {
        const diff = edgeY - curY
        if (Math.abs(diff) < Math.abs(minYDiff) && Math.abs(diff) < SNAP_THRESHOLD) {
          minYDiff = diff
        }
      })
    })

    return { minXDiff, minYDiff }
  }

  // 计算与其他box的吸附偏移
  function calculateBoxSnap(id: string, data: BoxPosition) {
    const { x, y, width, height } = data
    let minXDiff = SNAP_THRESHOLD + 1
    let minYDiff = SNAP_THRESHOLD + 1

    boxConfigs.forEach((box) => {
      if (box.id === id) return
      const position = box.position

      // 水平方向吸附 - 只吸附边缘
      const curEdges = [x, x + width]
      const edges = [position.x, position.x + position.width]
      curEdges.forEach((curX) => {
        edges.forEach((edgeX) => {
          const diff = edgeX - curX
          if (Math.abs(diff) < Math.abs(minXDiff) && Math.abs(diff) < SNAP_THRESHOLD) {
            minXDiff = diff
          }
        })
      })

      // 垂直方向吸附 - 只吸附边缘
      const curVEdges = [y, y + height]
      const vEdges = [position.y, position.y + position.height]
      curVEdges.forEach((curY) => {
        vEdges.forEach((edgeY) => {
          const diff = edgeY - curY
          if (Math.abs(diff) < Math.abs(minYDiff) && Math.abs(diff) < SNAP_THRESHOLD) {
            minYDiff = diff
          }
        })
      })
    })

    return { minXDiff, minYDiff }
  }

  // 应用吸附偏移
  function applySnap(
    data: BoxPosition,
    boxSnap: { minXDiff: number; minYDiff: number },
    screenSnap: { minXDiff: number; minYDiff: number }
  ) {
    let { x, y, width, height } = data

    // 优先使用较小的偏移量
    const finalXDiff =
      Math.abs(boxSnap.minXDiff) <= Math.abs(screenSnap.minXDiff)
        ? boxSnap.minXDiff
        : screenSnap.minXDiff
    const finalYDiff =
      Math.abs(boxSnap.minYDiff) <= Math.abs(screenSnap.minYDiff)
        ? boxSnap.minYDiff
        : screenSnap.minYDiff

    if (Math.abs(finalXDiff) <= SNAP_THRESHOLD) x += finalXDiff
    if (Math.abs(finalYDiff) <= SNAP_THRESHOLD) y += finalYDiff

    return { x, y, width, height }
  }

  // box 拖动/缩放时回调（含窗口边缘吸附）
  function handleBoxChange(id: string, data: BoxPosition) {
    draggingId.current = id

    // 计算辅助线
    const lines = getAllGuides(id, data)
    setGuideLines(lines)

    // 计算吸附偏移
    const boxSnap = calculateBoxSnap(id, data)
    const screenSnap = calculateScreenSnap(data)

    // 应用吸附
    const snappedPosition = applySnap(data, boxSnap, screenSnap)

    return snappedPosition
  }

  // 拖动/缩放结束，隐藏辅助线
  function handleBoxStop() {
    setGuideLines([])
    draggingId.current = null
  }

  // 渲染辅助线
  function renderGuides() {
    return guideLines.map((g, i) =>
      g.type === 'vertical' ? (
        <div
          key={'v' + i}
          style={{
            position: 'fixed',
            left: g.position,
            top: 0,
            width: 2,
            height: '100vh',
            background: 'rgba(0,153,255,0.7)',
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        />
      ) : (
        <div
          key={'h' + i}
          style={{
            position: 'fixed',
            top: g.position,
            left: 0,
            height: 2,
            width: '100vw',
            background: 'rgba(0,153,255,0.7)',
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        />
      )
    )
  }
  return (
    <>
      {boxConfigs.map((box) => (
        <FencesBox
          key={box.id}
          boxConfig={box}
          onBoxChange={handleBoxChange}
          onBoxStop={handleBoxStop}
        />
      ))}
      {renderGuides()}
    </>
  )
}

export function DesktopManger() {
  // box 配置
  const [boxConfigs, setBoxConfigs] = useState<BoxConfig[]>([])

  // 桌面背景
  const [desktopBackground, setDesktopBackground] = useState<string | null>(null)

  // 文件移动函数
  const moveFile = (fromGroupId: string, fromIndex: number, toGroupId: string, toIndex: number) => {
    if (fromGroupId === toGroupId && fromIndex === toIndex) return

    setBoxConfigs((config) => {
      // 找到源分组和目标分组
      const fromBoxIndex = config.findIndex((box) => box.id === fromGroupId)
      const toBoxIndex = config.findIndex((box) => box.id === toGroupId)

      if (fromBoxIndex === -1 || toBoxIndex === -1) {
        return config
      }

      // 深拷贝分组，确保文件数组也被正确拷贝

      const fromBoxFiles = [...config[fromBoxIndex].files]
      const toBoxFiles = fromGroupId === toGroupId ? fromBoxFiles : [...config[toBoxIndex].files]

      // 从源分组中移除文件
      const [movedFile] = fromBoxFiles.splice(fromIndex, 1)
      if (!movedFile) {
        return config
      }

      // 将文件插入到目标分组
      toBoxFiles.splice(toIndex, 0, movedFile)

      // 更新配置
      config[fromBoxIndex].files = fromBoxFiles
      config[toBoxIndex].files = toBoxFiles

      return config
    })
  }

  useEffect(() => {
    // 获取桌面文件
    window.api.getDesktopFiles().then((files) => {
      const exeFiles = files.filter((f) => ['exe', 'lnk'].includes(f.ext))
      const otherFiles = files.filter((f) => !['exe', 'lnk'].includes(f.ext))
      setBoxConfigs([
        {
          id: 'exe',
          name: '程序',
          files: exeFiles,
          position: { x: 100, y: 100, width: 380, height: 220 }
        },
        {
          id: 'others',
          name: '默认分组',
          files: otherFiles,
          position: { x: 520, y: 100, width: 380, height: 220 }
        }
      ])
    })

    // 获取桌面背景
    window.api.getDesktopBackground().then((background) => {
      setDesktopBackground(background)
    })
  }, [])

  return (
    <div
      className="relative h-lvh w-lvw overflow-hidden"
      style={{
        backgroundImage: desktopBackground ? `url(${desktopBackground})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <IconManager boxConfigs={boxConfigs} onMoveFile={moveFile}>
        <BoxManager boxConfigs={boxConfigs} />
      </IconManager>
    </div>
  )
}
