import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/components/ui/context-menu'

export function DesktopMenu(props: { children: React.ReactNode }) {
  function onClose() {
    window.close()
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>{props.children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Setting</ContextMenuItem>
        <ContextMenuItem onClick={() => onClose()}>Close</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
