import { create } from 'zustand'

type CreateJobModalState = {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useCreateJobModal = create<CreateJobModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false })
}))