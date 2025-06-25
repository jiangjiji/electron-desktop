import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import { appEvent } from '@renderer/common/appEvent'
import { cn } from '@renderer/lib/utils'
import {
  Eye,
  Grid3X3,
  List,
  Monitor,
  RefreshCw,
  Settings,
  SortAsc,
  SortDesc,
  X
} from 'lucide-react'

const styles = {
  menuContent: cn(
    'overflow-visible border-gray-200/50 bg-white/90 text-gray-900 backdrop-blur-xl backdrop-saturate-200'
  ),
  menuItem: cn(
    'h-8 gap-2 text-sm font-medium hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600'
  ),
  menuIcon: cn('h-4 w-4 text-gray-600')
}

export function DesktopMenu(props: { children: React.ReactNode }) {
  function onClose() {
    window.close()
  }

  function onRefresh() {
    window.location.reload()
  }

  function onRefreshBackground() {
    appEvent.emit('desktop-background-refresh')
  }

  function onViewMode(mode: 'grid' | 'list') {
    console.log('View mode:', mode)
  }

  function onSort(mode: 'asc' | 'desc') {
    console.log('Sort mode:', mode)
  }

  function onToggleVisibility() {
    console.log('Toggle visibility')
  }

  function onDisplaySettings() {
    console.log('Display settings')
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>{props.children}</ContextMenuTrigger>
      <ContextMenuContent className={styles.menuContent}>
        {/* 查看选项 */}
        <ContextMenuItem className={styles.menuItem} onClick={() => onViewMode('grid')}>
          <Grid3X3 className={styles.menuIcon} />
          <span>网格视图</span>
        </ContextMenuItem>

        <ContextMenuItem className={styles.menuItem} onClick={() => onViewMode('list')}>
          <List className={styles.menuIcon} />
          <span>列表视图</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* 排序选项 */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className={styles.menuItem}>
            <SortAsc className={styles.menuIcon} />
            <span>排序方式</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className={styles.menuContent}>
            <ContextMenuItem className={styles.menuItem} onClick={() => onSort('asc')}>
              <SortAsc className={styles.menuIcon} />
              <span>按名称升序</span>
            </ContextMenuItem>
            <ContextMenuItem className={styles.menuItem} onClick={() => onSort('desc')}>
              <SortDesc className={styles.menuIcon} />
              <span>按名称降序</span>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        {/* 显示选项 */}
        <ContextMenuItem className={styles.menuItem} onClick={onToggleVisibility}>
          <Eye className={styles.menuIcon} />
          <span>显示桌面图标</span>
        </ContextMenuItem>

        <ContextMenuItem className={styles.menuItem} onClick={onDisplaySettings}>
          <Monitor className={styles.menuIcon} />
          <span>显示设置</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* 刷新 */}
        <ContextMenuItem className={styles.menuItem} onClick={onRefresh}>
          <RefreshCw className={styles.menuIcon} />
          <span>刷新</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* 刷新背景 */}
        <ContextMenuItem className={styles.menuItem} onClick={onRefreshBackground}>
          <RefreshCw className={styles.menuIcon} />
          <span>刷新桌面背景</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* 设置和关闭 */}
        <ContextMenuItem className={styles.menuItem}>
          <Settings className={styles.menuIcon} />
          <span>设置</span>
        </ContextMenuItem>

        <ContextMenuItem className={styles.menuItem} variant="destructive" onClick={onClose}>
          <X className={styles.menuIcon} />
          <span>关闭</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
