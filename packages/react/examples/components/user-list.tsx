import { useState } from 'react'
import { AddUser, UserItem } from './add-user.tsx'

export function UserList () {
  const [userList, setUserList] = useState<UserItem[]>([])

  async function handleAdd () {
    const newUser = await AddUser.render()

    setUserList([...userList, newUser])
  }

  async function handleEdit (userIndex: number) {
    const newUser = await AddUser.render({
      user: userList[userIndex]
    })

    setUserList((userList) => userList.map((user, index) => {
      return index === userIndex ? newUser : user
    }))
  }

  return (
    <>
      <h2>User List</h2>

      <button className="btn btn-primary" onClick={handleAdd}>Add</button>

      <table className="table">
        <thead>
        <tr>
          <th>Name</th>
          <th>Age</th>
          <th>Operation</th>
        </tr>
        </thead>

        <tbody>
        {
          userList.map((user, index) => (
            <tr key={index}>
              <td>{user.name}</td>
              <td>{user.age}</td>
              <td>
                <button className="btn btn-light" onClick={() => handleEdit(index)}>Edit</button>
              </td>
            </tr>
          ))
        }
        </tbody>
      </table>
    </>
  )
}