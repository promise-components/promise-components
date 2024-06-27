import {
  createElement,
  useEffect,
  useState,
  FunctionComponent,
  ReactElement,
} from 'react'

/**
 * The basic props of the PromiseComponent
 * @property resolve Promise Operation Success Callback (Resolved)
 * @property reject Promise Operation Failure Callback (Rejected)
 */
export interface PromiseResolvers<T> {
  resolve: (value: T) => void,
  reject: (reason?: any) => void
}

type Dispatch = (value: (components: ReactElement[]) => ReactElement[]) => void

/**
 * Shared Object
 * @property count The value of the `key` attribute used when looping components
 * @property dispatch Dispatching that update the state of a public slot
 */
interface Shared {
  count: number,
  dispatch: Dispatch
}

/**
 * Determine whether it is a browser environment
 */
const IN_BROWSER = typeof window !== 'undefined'

/**
 * Shared Object
 */
let SHARED = createShared()

/**
 * Create a shared object
 * In the browser environment, the object will be stored on the window, so that multiple applications with different builds on a page can share this object (such as microservice architecture)
 */
function createShared (appId?: string): Shared {
  const key = '__PROMISE_COMPONENTS_SHARED_REACT__' + (appId || '')
  const root: any = IN_BROWSER ? window : {}

  return root[key] || (root[key] = <Shared>{
    count: 0,
    dispatch: () => {}
  })
}

/**
 * Create a slot component
 * @param name slot component name
 * @param setDispatch set dispatch
 */
function createSlot (name: string, setDispatch: (dispatch: Dispatch | null) => void): FunctionComponent {
  const Slot: FunctionComponent = IN_BROWSER
    ? () => {
      const [components, dispatch] = useState<ReactElement[]>([])

      useEffect(() => {
        // Bind dispatch to update slot states
        setDispatch(dispatch)

        // When the slot component is destroyed, clean up the dispatch reference to prevent memory leaks
        return () => {
          setDispatch(null)
        }
      }, [])

      return components
    }

    // Empty slot
    // In non-browser environments (such as SSR), slot components do not require any state, which can avoid some unnecessary initialization overhead (although the impact may be very small)
    : () => null

  Slot.displayName = name

  return Slot
}

/**
 * Public slot of Promise components
 */
export const SharedSlot = createSlot('SharedSlot', (dispatch) => {
  SHARED.dispatch = dispatch || (() => {})
})

/**
 * Promise component constructor
 */
export class PromiseComponent<T extends PromiseResolvers<any>, P = Omit<T, keyof PromiseResolvers<any>>, R = Parameters<T['resolve']>[0]> {
  private _slot: FunctionComponent | null = null
  private _dispatch: Dispatch | null = null

  constructor (public Component: FunctionComponent<T>) {}

  /**
   * promise rendering
   * @param props component props
   */
  render (...props: {} extends P ? [P?] : [P]): Promise<R>
  render (props?: P) {
    let component: ReactElement

    // If the current instance does not have a `_dispatch` method,
    // it means that no custom slot is used, and the component will be rendered to the public slot
    const dispatch = this._dispatch || SHARED.dispatch

    const promise = new Promise<R>((resolve, reject) => {
      // Create a component instance
      component = createElement(this.Component, {
        ...<any>props,
        resolve,
        reject,
        key: SHARED.count++,
      })

      // Dispatch this component instance to the slot for rendering
      dispatch((components) => [...components, component])
    })

    const destroy = () => {
      dispatch((components) => components.filter((item) => item !== component))
    }

    // Destroy the component immediately after use
    promise.then(destroy, destroy)

    return promise
  }

  /**
   * Custom slot for Promise component
   */
  get Slot (): FunctionComponent {
    return this._slot || (this._slot = createSlot(`${this.Component.name || 'PromiseComponent'}.Slot`, (dispatch) => {
      this._dispatch = dispatch
    }))
  }
}
