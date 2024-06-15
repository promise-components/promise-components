import { SharedSlot } from '@promise-components/react'
import { Main } from './pages/main.tsx'

export default function App () {
  return (
    <>
      <Main/>
      <SharedSlot/>
    </>
  )
}