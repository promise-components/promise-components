import {
  h,
  onBeforeUnmount,
  shallowRef,
  Component,
  ComponentOptions,
  ComponentPublicInstance,
  VNode,
} from 'vue'

/**
 * The basic props of the PromiseComponent
 * @property resolve Promise Operation Success Callback (Resolved)
 * @property reject Promise Operation Failure Callback (Rejected)
 */
export interface PromiseResolvers<T> {
  resolve: (value: T) => void,
  reject: (reason?: any) => void
}

type Dispatch = (value: (components: VNode[]) => VNode[]) => void

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
const SHARED = createShared()

/**
 * Create a shared object
 * In the browser environment, the object will be stored on the window, so that multiple applications with different builds on a page can share this object (such as microservice architecture)
 * Of course, if there are different built applications on a page, and they all have their own public slots, this is more troublesome. If this happens, please raise an issue and I will find a way to solve it
 */
function createShared (appId?: string): Shared {
  const key = '__PROMISE_COMPONENTS_SHARED_VUE__' + (appId || '')
  const root: Record<string, Shared> = IN_BROWSER ? window as any : {}

  return root[key] || (root[key] = {
    count: 0,
    dispatch: () => {}
  })
}

/**
 * Create a slot component
 * @param name slot component name
 * @param setDispatch set dispatch
 */
function createSlot (name: string, setDispatch: (dispatch: Dispatch | null) => void): ComponentOptions {
  return IN_BROWSER
    ? {
      name,
      setup () {
        const components = shallowRef<VNode[]>([])

        // Bind dispatch to update slot states
        setDispatch((value) => {
          components.value = value(components.value)
        })

        // When the slot component is destroyed, clean up the dispatch reference to prevent memory leaks
        onBeforeUnmount(() => {
          setDispatch(null)
        })

        return () => components.value
      }
    }

    // Empty slot
    // In non-browser environments (such as SSR), slot components do not require any state, which can avoid some unnecessary initialization overhead (although the impact may be very small)
    : {
      name,
      render: () => null
    }
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
export class PromiseComponent<T extends PromiseResolvers<any>, P = Omit<T, keyof (PromiseResolvers<any> & ComponentPublicInstance)>, R = Parameters<T['resolve']>[0]> {
  private _slot: ComponentOptions | null = null
  private _dispatch: Dispatch | null = null

  constructor (public Component: Component<T>) {}

  /**
   * promise rendering
   * @param props component props
   */
  render (...props: {} extends P ? [P?] : [P]): Promise<R>
  render (props?: P) {
    let component: VNode

    // If the current instance does not have a `_dispatch` method,
    // it means that no custom slot is used, and the component will be rendered to the public slot
    const dispatch = this._dispatch || SHARED.dispatch

    const promise = new Promise<R>((resolve, reject) => {
      // Create a component instance
      component = h(this.Component, {
        ...<any>props,
        resolve,
        reject,
        key: SHARED.count++,
      })

      // Send the instance to the specified slot component for rendering
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
  get Slot (): ComponentOptions {
    return this._slot || (this._slot = createSlot(`${this.Component.name || 'PromiseComponent'}.Slot`, (dispatch) => {
      this._dispatch = dispatch
    }))
  }
}
