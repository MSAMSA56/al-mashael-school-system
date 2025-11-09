import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'admin' | 'director';
  profileImage?: string;
}

interface AuthStore {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => void;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      loading: true,
      error: null,
      isAuthenticated: false,

      login: async (email: string, password: string, role: string) => {
        try {
          set({ loading: true, error: null });

          // Sign in with Firebase
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;

          // Get user data from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (!userDocSnap.exists()) {
            throw new Error('User profile not found');
          }

          const userData = userDocSnap.data();

          // Verify role matches
          if (userData.role !== role) {
            await signOut(auth);
            throw new Error('Invalid role for this account');
          }

          const user: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            role: userData.role,
            profileImage: userData.profileImage,
          };

          set({
            user,
            isAuthenticated: true,
            loading: false,
            token: await firebaseUser.getIdToken(),
          });
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to login';
          set({
            error: errorMessage,
            loading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ loading: true });
          await signOut(auth);
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null,
            token: null,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Failed to logout',
            loading: false,
          });
        }
      },

      initAuth: () => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
          if (firebaseUser) {
            try {
              // Get user data from Firestore
              const userDocRef = doc(db, 'users', firebaseUser.uid);
              const userDocSnap = await getDoc(userDocRef);

              if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                const user: User = {
                  id: firebaseUser.uid,
                  email: firebaseUser.email || '',
                  firstName: userData.firstName || '',
                  lastName: userData.lastName || '',
                  role: userData.role,
                  profileImage: userData.profileImage,
                };

                const token = await firebaseUser.getIdToken();

                set({
                  user,
                  isAuthenticated: true,
                  loading: false,
                  token,
                });
              } else {
                set({
                  user: null,
                  isAuthenticated: false,
                  loading: false,
                });
              }
            } catch (error) {
              set({
                user: null,
                isAuthenticated: false,
                loading: false,
              });
            }
          } else {
            set({
              user: null,
              isAuthenticated: false,
              loading: false,
            });
          }
        });

        return unsubscribe;
      },

      clearError: () => {
        set({ error: null });
      },

      setUser: (user: User | null) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
