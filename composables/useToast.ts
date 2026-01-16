import { ref } from 'vue'

export interface Toast {
    id: number
    message: string
    type: 'success' | 'error' | 'info'
    action?: {
        label: string
        onClick: () => void
    }
}

const toasts = ref<Toast[]>([])
let idCounter = 0

export const useToast = () => {
    const addToast = (
        message: string,
        type: 'success' | 'error' | 'info' = 'info',
        duration = 3000,
        action?: { label: string, onClick: () => void }
    ) => {
        const id = idCounter++
        const toast: Toast = { id, message, type, action }
        toasts.value.push(toast)

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }
    }

    const removeToast = (id: number) => {
        toasts.value = toasts.value.filter(t => t.id !== id)
    }

    const success = (msg: string, action?: { label: string, onClick: () => void }) => addToast(msg, 'success', 3000, action)
    const error = (msg: string) => addToast(msg, 'error')
    const info = (msg: string) => addToast(msg, 'info')

    // Alias for show(message, type) pattern
    const show = (msg: string, type: 'success' | 'error' | 'info' = 'info') => addToast(msg, type)

    return {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        info,
        show
    }
}
