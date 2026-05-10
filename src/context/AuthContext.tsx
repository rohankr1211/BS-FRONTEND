import React, { createContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthState, User } from '../types';

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  updateProfile: (user: Partial<User>) => void;
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  user: null, // Will be fetched/populated if token exists
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: true, // Start true while we check if token is valid
};

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { token: string; user: User } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isLoading: false, isAuthenticated: true };
    default:
      return state;
  }
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check token on mount. If token exists but no user data, ideally we'd fetch profile here.
    // For now, if we have a token, we stop loading.
    if (state.token && !state.user) {
      // TODO: Fetch user profile using token to restore state on refresh
      // api.get('/users/profile').then(res => dispatch({type: 'SET_USER', payload: res.data})).catch(() => dispatch({type: 'LOGOUT'}))
      dispatch({ type: 'SET_LOADING', payload: false });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.token]);

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = (user: Partial<User>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: user });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
