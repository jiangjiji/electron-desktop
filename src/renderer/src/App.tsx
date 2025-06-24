import './App.css'
import { DesktopManger } from './components/DesktopManger'
import { DesktopMenu } from './components/DesktopMenu'

function App() {
  return (
    <DesktopMenu>
      <DesktopManger />
    </DesktopMenu>
  )
}

export default App
