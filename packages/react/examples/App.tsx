import { SharedSlot } from '@promise-components/react/src'
import { Main } from './pages/main.tsx'

export default function App () {
  return (
    <>
      <Main/>
      <SharedSlot/>
    </>
  )
}