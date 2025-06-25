import { BoxPosition, FencesBox, type BoxConfig } from '@/components/FencesBox'
import { useEffect, useRef, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

// 对齐辅助线的吸附距离
const SNAP_THRESHOLD = 4

// 辅助线类型
interface GuideLine {
  type: 'vertical' | 'horizontal'
  position: number
}

export function DesktopManger() {
  // box 配置
  const [boxConfigs, setBoxConfigs] = useState<BoxConfig[]>([])
  // 当前辅助线
  const [guideLines, setGuideLines] = useState<GuideLine[]>([])
  // 当前正在拖动/缩放的box id
  const draggingId = useRef<string | null>(null)
  // 桌面背景
  const [desktopBackground, setDesktopBackground] = useState<string | null>(null)

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

  // 只实现组内拖拽
  const moveFile = (from: number, to: number) => {
    setBoxConfigs((prev) => {
      const group = prev[0]
      const files = [...group.files]
      const [moved] = files.splice(from, 1)
      files.splice(to, 0, moved)
      return [{ ...group, files }]
    })
  }

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
      <DndProvider backend={HTML5Backend}>
        {boxConfigs.map((box) => (
          <FencesBox
            key={box.id}
            boxConfig={box}
            moveFile={moveFile}
            onBoxChange={handleBoxChange}
            onBoxStop={handleBoxStop}
          />
        ))}
        {renderGuides()}
      </DndProvider>
    </div>
  )
}
