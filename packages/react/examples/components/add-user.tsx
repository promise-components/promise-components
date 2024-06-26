import { PromiseComponent, PromiseResolvers } from '@promise-components/react'
import { FormEvent, useState } from 'react'

export interface UserItem {
  name: string
  age: number
  id: number
}

/**
 * 🔴 The Props parameter must inherit from PromiseResolvers
 */
interface Props extends PromiseResolvers<UserItem> {
  user?: UserItem
}

/**
 * 🔴 Create a PromiseComponent instance
 */
export const AddUser = new PromiseComponent((props: Props) => {
  const [formData, setFormData] = useState(() => {
    return {
      name: '',
      age: 0,
      id: Math.random(),
      ...props.user, // If editing, fill in the default value
    }
  })

  function handleSubmit () {
    if (!formData.name) return alert('Please enter `Name`')
    if (!formData.age) return alert('Please enter `Age`')

    // 🔴 Call resolve callback
    props.resolve(formData)
  }

  function handleCancel () {
    // 🔴 Call reject callback
    props.reject()
  }

  function handleInput (key: keyof UserItem) {
    return (evt: FormEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [key]: evt.currentTarget.value
      })
    }
  }

  return (
    <dialog open>
      <h2>React dialog</h2>

      <form>
        <p>
          <span>Name: </span>
          <input value={formData.name} onInput={handleInput('name')} type="text"/>
        </p>

        <p>
          <span>Age: </span>
          <input value={formData.age} onInput={handleInput('age')} type="number" min={0}/>
        </p>
      </form>

      <p>
        <button onClick={handleCancel}>Cancel</button>
        <button onClick={handleSubmit}>Submit</button>
      </p>
    </dialog>
  )
})