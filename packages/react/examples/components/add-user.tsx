import { FormEvent } from 'react'
import { PromiseComponent, PromiseComponentProps } from '@promise-components/react'

export interface UserItem {
  name: string
  age: number
}

interface Props extends PromiseComponentProps<UserItem> {
  user?: UserItem // edit mode
}

export const AddUser = new PromiseComponent((props: Props) => {
  function handleSubmit (evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault()
    props.resolve(Object.fromEntries(new FormData(evt.target)))
  }

  function handleCancel () {
    props.reject()
  }

  return (
    <>
      <div className="modal-backdrop fade show"></div>

      <div className="modal show" style={{ display: 'block' }}>
        <div className="modal-dialog">
          <form onSubmit={handleSubmit} className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">Add User</h1>
              <button className="btn-close" onClick={handleCancel}></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="addUserNameInput" className="form-label">Name <i className="text-danger">*</i></label>
                <input id="addUserNameInput" required name="name" defaultValue={props.user?.name} type="text"
                       className="form-control"/>
              </div>

              <div className="mb-3">
                <label htmlFor="addUserAgeInput" className="form-label">Age <i className="text-danger">*</i></label>
                <input id="addUserAgeInput" min={1} required name="age" defaultValue={props.user?.age} type="number"
                       className="form-control"/>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={handleCancel} className="btn btn-light">Cancel</button>
              <button type="submit" className="btn btn-primary">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
})