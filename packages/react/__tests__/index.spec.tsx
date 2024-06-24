// @vitest-environment jsdom

import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useState } from 'react'
import { SharedSlot, PromiseComponent, PromiseResolvers } from '@promise-components/react'

function App () {
  return (
    <div>
      <Home/>
      <SharedSlot/>
    </div>
  )
}

function Home () {
  const [result, setResult] = useState('')

  const handleOpen = () => {
    TestComponent.render().then(setResult, setResult)
  }

  return (
    <div>
      <span>{result && `Result: ${result}`}</span>
      <button onClick={handleOpen}>Open</button>
    </div>
  )
}

const TestComponent = new PromiseComponent((props: PromiseResolvers<any>) => {
  return (
    <div>
      <span>Test text</span>
      <button onClick={() => props.resolve('Resolved!')}>Resolve</button>
      <button onClick={() => props.reject('Rejected!')}>Reject</button>
    </div>
  )
})

describe('@promise-components/react', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('renders and resolves a promise', async () => {
    render(<App/>)

    expect(screen.queryByText('Test text')).toBeNull()
    expect(screen.queryByText('Result: Resolved!')).toBeNull()

    await userEvent.click(screen.getByText('Open'))
    expect(screen.queryByText('Test text')).not.toBeNull()

    await userEvent.click(screen.getByText('Resolve'))
    expect(screen.queryByText('Test text')).toBeNull()
    expect(screen.queryByText('Result: Resolved!')).not.toBeNull()
  })

  test('renders and rejects a promise', async () => {
    render(<App/>)

    expect(screen.queryByText('Test text')).toBeNull()
    expect(screen.queryByText('Result: Rejected!')).toBeNull()

    await userEvent.click(screen.getByText('Open'))
    expect(screen.queryByText('Test text')).not.toBeNull()

    await userEvent.click(screen.getByText('Reject'))
    expect(screen.queryByText('Test text')).toBeNull()
    expect(screen.queryByText('Result: Rejected!')).not.toBeNull()
  })

  test('multiple renders and resolves', async () => {
    render(<App/>)

    expect(screen.queryAllByText('Test text').length).toBe(0)

    await userEvent.click(screen.getByText('Open'))
    await userEvent.click(screen.getByText('Open'))
    await userEvent.click(screen.getByText('Open'))
    expect(screen.queryAllByText('Test text').length).toBe(3)

    const resolveButtons = screen.getAllByText('Resolve')
    for (const resolveBtn of resolveButtons) {
      await userEvent.click(resolveBtn)
    }
    expect(screen.queryAllByText('Test text').length).toBe(0)
  })
})