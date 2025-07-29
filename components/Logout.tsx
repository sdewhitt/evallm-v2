import React from 'react'
import { doLogout } from '@/app/actions'
const Logout = () => {
  return (
    <form action={doLogout}>
      <button 
        className="fixed top-3 right-10 space-y-4 bg-emerald-700 hover:bg-emerald-800 transition-all p-3 rounded-xl"
        type="submit">
        Logout
    </button>
    </form>
  )
}

export default Logout