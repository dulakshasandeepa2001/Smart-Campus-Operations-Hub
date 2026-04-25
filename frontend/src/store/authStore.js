import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      setUser: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: !!token,
        }),

      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      logout: () => {
        // Clear Zustand state first
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });

        // Then clear localStorage
        localStorage.removeItem('auth-store');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Dispatch logout event for cross-tab synchronization
        window.dispatchEvent(new Event('logout'));
      },

      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Listen for logout events from other tabs
if (typeof window !== 'undefined') {
  // Listen for storage changes from other tabs
  window.addEventListener('storage', (e) => {
    if (e.key === 'auth-store' && (!e.newValue || e.newValue === '')) {
      // Auth store was cleared in another tab
      const state = useAuthStore.getState();
      state.set?.({
        user: null,
        token: null,
        isAuthenticated: false,
      }) || useAuthStore.setState({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  });

  // Listen for custom logout event from current tab
  window.addEventListener('logout', () => {
    // This ensures immediate update in same tab
    // The logout() call already handles state updates
  });
}

