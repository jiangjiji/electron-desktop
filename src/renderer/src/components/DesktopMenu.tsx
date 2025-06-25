import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import { cn } from '@renderer/lib/utils'
import { Eye, RefreshCw, Settings, X } from 'lucide-react'

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

  function onToggleVisibility() {
    console.log('Toggle visibility')
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>{props.children}</ContextMenuTrigger>
      <ContextMenuContent className={styles.menuContent}>
        <ContextMenuItem className={styles.menuItem} onClick={onToggleVisibility}>
          <Eye className={styles.menuIcon} />
          <span>显示桌面图标</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem className={styles.menuItem} onClick={onRefresh}>
          <RefreshCw className={styles.menuIcon} />
          <span>刷新</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

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
