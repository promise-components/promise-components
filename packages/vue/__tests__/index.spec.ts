// @vitest-environment jsdom

import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { userEvent } from '@testing-library/user-event'
import { h, ref, provide, inject, Ref } from 'vue'
import { SharedSlot, PromiseComponent, PromiseResolvers } from '@promise-components/vue'

const App = {
  setup: () => {
    const theme = ref('dark')

    provide('theme', theme)

    return () => h('div', [
      h('button', {
        onClick: () => {
          theme.value = 'light'
        }
      }, 'ChangeTheme'),
      h(Home),
      h(SharedSlot)
    ])
  }
}

const Home = {
  setup: () => {
    const result = ref('')

    const setResult = (v: string) => {
      result.value = v
    }

    const handleOpen = () => {
      TestComponent.render().then(setResult, setResult)
    }

    return () => h('div', [
      h('span', result ? `Result: ${result.value}` : ''),
      h('button', {
        onClick: handleOpen
      }, 'Open')
    ])
  }
}

const TestComponent = new PromiseComponent<PromiseResolvers<any>>({
  props: {
    resolve: Function,
    reject: Function,
  },
  setup: (props) => {
    const theme = inject<Ref<string>>('theme')

    return () => h('div', [
      h('span', 'Test text'),
      h('span', `Theme: ${theme?.value}`),
      h('button', {
        onClick: () => {
          props.resolve('Resolved!')
        }
      }, 'Resolve'),
      h('button', {
        onClick: () => {
          props.reject('Rejected!')
        }
      }, 'Reject'),
    ])
  }
})

describe('@promise-components/vue', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('renders and resolves a promise', async () => {
    render(App)

    expect(screen.queryByText('Test text')).toBeNull()
    expect(screen.queryByText('Result: Resolved!')).toBeNull()

    await userEvent.click(screen.getByText('Open'))
    expect(screen.queryByText('Test text')).not.toBeNull()

    await userEvent.click(screen.getByText('Resolve'))
    expect(screen.queryByText('Test text')).toBeNull()
    expect(screen.queryByText('Result: Resolved!')).not.toBeNull()
  })

  test('renders and rejects a promise', async () => {
    render(App)

    expect(screen.queryByText('Test text')).toBeNull()
    expect(screen.queryByText('Result: Rejected!')).toBeNull()

    await userEvent.click(screen.getByText('Open'))
    expect(screen.queryByText('Test text')).not.toBeNull()

    await userEvent.click(screen.getByText('Reject'))
    expect(screen.queryByText('Test text')).toBeNull()
    expect(screen.queryByText('Result: Rejected!')).not.toBeNull()
  })

  test('multiple renders and resolves', async () => {
    render(App)

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

  test('Uses contexts', async () => {
    render(App)

    expect(screen.queryByText('Theme: dark')).toBeNull()

    await userEvent.click(screen.getByText('Open'))
    expect(screen.queryByText('Theme: dark')).not.toBeNull()

    await userEvent.click(screen.getByText('Resolve'))
    expect(screen.queryByText('Theme: dark')).toBeNull()

    await userEvent.click(screen.getByText('ChangeTheme'))

    expect(screen.queryByText('Theme: light')).toBeNull()

    await userEvent.click(screen.getByText('Open'))
    expect(screen.queryByText('Theme: light')).not.toBeNull()

    await userEvent.click(screen.getByText('Resolve'))
    expect(screen.queryByText('Theme: light')).toBeNull()
  })
})
