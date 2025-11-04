import { createContext, useState, useEffect, useContext } from 'react'
import { User } from '../types/user.type'
import { getAccessTokenFormLS, getProfileFromLS, getRefreshTokenFormLS } from '../utils/auth'

export interface AppContextInterface {
  isAuthenticated: boolean
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  profile: User | null
  setProfile: React.Dispatch<React.SetStateAction<User | null>>
  refreshToken: string
  setRefreshToken: React.Dispatch<React.SetStateAction<string>>
  reset: () => void
  token: string
  setToken: React.Dispatch<React.SetStateAction<string>>
}

export const getInitialAppContext: () => AppContextInterface = () => ({
  isAuthenticated: Boolean(getAccessTokenFormLS()),
  setIsAuthenticated: () => null,
  profile: getProfileFromLS(),
  setProfile: () => null,
  token: getAccessTokenFormLS() || '',
  setToken: () => null,
  refreshToken: getRefreshTokenFormLS() || '',
  setRefreshToken: () => null,
  reset: () => null
})

const initialAppContext = getInitialAppContext()

export const AppContext = createContext<AppContextInterface>(initialAppContext)

export const AppProvider = ({
  children,
  defaultValue = initialAppContext
}: {
  children: React.ReactNode
  defaultValue?: AppContextInterface
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(defaultValue.isAuthenticated)
  const [profile, setProfile] = useState<User | null>(defaultValue.profile)
  const [token, setToken] = useState<string>(defaultValue.token)
  const [refreshToken, setRefreshToken] = useState<string>(defaultValue.refreshToken)

  // Khi người dùng logout hay clear session, reset toàn bộ
  const reset = () => {
    setIsAuthenticated(false)
    setProfile(null)
    setToken('')
    setRefreshToken('')
    localStorage.clear()
  }

  // Optional: lắng nghe thay đổi localStorage để sync giữa các tab
  useEffect(() => {
    const handleStorage = () => {
      setIsAuthenticated(Boolean(getAccessTokenFormLS()))
      setProfile(getProfileFromLS())
      setRefreshToken(getRefreshTokenFormLS() || '')
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        profile,
        setProfile,
        token,
        setToken,
        refreshToken,
        setRefreshToken,
        reset
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

// Custom hook gọi nhanh
export const useAppContext = () => useContext(AppContext)
