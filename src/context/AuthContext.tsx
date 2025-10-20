import { createContext, useState, useEffect, useContext } from 'react'
import { Role } from '../constants/Roles'

interface AuthContextType {
  userRole: Role | null
  setUserRole: (role: Role | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  userRole: null,
  setUserRole: () => {},
  logout: () => {}
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userRole, setUserRole] = useState<Role | null>(() => {
    const storedRole = localStorage.getItem('role')
    return storedRole && Object.values(Role).includes(storedRole as Role) ? (storedRole as Role) : null
  })

  useEffect(() => {
    const handleStorage = () => {
      const storedRole = localStorage.getItem('role')
      setUserRole(storedRole ? (storedRole as Role) : null)
    }
    window.addEventListener('storage', handleStorage) // lắng nghhe có sự thay đổi trong storega không
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const logout = () => {
    localStorage.removeItem('role')
    setUserRole(null)
  }

  return <AuthContext.Provider value={{ userRole, setUserRole, logout }}>{children}</AuthContext.Provider>
}

// Custom hook giúp gọi nhanh
export const useAuth = () => useContext(AuthContext)
