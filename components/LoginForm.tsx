import React from 'react'
import { doSocialLogin } from '@/app/actions';

const LoginForm = () => {
  return (
    <form action={doSocialLogin}>
      <button 
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        type="submit" name="action" value="google">
        Sign in with Google
      </button>
    </form>
  )
}

export default LoginForm