// Standalone TaskBoard Logic
// Decoupled from core types to support future extraction into a package

export interface DeveloperTask {
    id?: string;
    title: string;
    type: 'feature' | 'bug' | 'design' | 'chore';
    priority: 'low' | 'med' | 'high';
    status: 'todo' | 'in_progress' | 'done';
    description?: string;
    goals?: string;
    section?: string;
    subsection?: string;
    createdAt: any;
}

export const useTaskBoard = () => {
    const { $db } = useNuxtApp()
    const toast = useToast()

    const tasks = ref<DeveloperTask[]>([])
    const newTask = ref<Omit<DeveloperTask, 'id' | 'createdAt'>>({
        title: '',
        type: 'feature',
        priority: 'med',
        status: 'todo',
        description: '',
        goals: '',
        section: 'Active Tasks (Engineering)',
        subsection: 'General'
    })
    const uploading = ref(false)

    // Firestore functions are dynamically imported within methods to ensure client-side execution

    const fetchTasks = async () => {
        try {
            // Need to manually import firebase functions if auto-import isn't reliable
            // But based on previous files, they are imported from 'firebase/firestore'
            // We will dynamically import to avoid top-level issues if SSR
            const { collection, getDocs, query, orderBy, where, Timestamp, writeBatch, doc } = await import('firebase/firestore')

            // Active Tasks
            const q = query(collection($db, 'tasks'), orderBy('createdAt', 'desc'))
            const snapshot = await getDocs(q)
            tasks.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DeveloperTask))

            // Lazy Cleanup (Async)
            cleanupArchivedTasks()
        } catch (e) {
            console.error(e)
        }
    }

    const cleanupArchivedTasks = async () => {
        try {
            const { collection, getDocs, query, where, Timestamp, writeBatch, doc } = await import('firebase/firestore')
            const cutoff = new Date()
            cutoff.setDate(cutoff.getDate() - 7)

            const q = query(collection($db, 'archived_tasks'), where('archivedAt', '<', Timestamp.fromDate(cutoff)))
            const snapshot = await getDocs(q)

            if (!snapshot.empty) {
                const batch = writeBatch($db)
                snapshot.docs.forEach(d => batch.delete(doc($db, 'archived_tasks', d.id)))
                await batch.commit()
            }
        } catch (e) { console.error('Cleanup failed', e) }
    }

    const submitTask = async () => {
        if (!newTask.value.title) return
        uploading.value = true
        try {
            const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')

            await addDoc(collection($db, 'tasks'), {
                ...newTask.value,
                createdAt: serverTimestamp()
            })

            // Reset form
            newTask.value = {
                title: '',
                type: 'feature',
                priority: 'med',
                status: 'todo',
                description: '',
                goals: '',
                section: 'Active Tasks (Engineering)',
                subsection: 'General'
            }
            await fetchTasks()
            toast.success('Task added successfully')
        } catch (e) {
            console.error(e)
            toast.error('Failed to add task')
        } finally {
            uploading.value = false
        }
    }

    const updateTaskStatus = async (taskId: string, status: 'todo' | 'in_progress' | 'done') => {
        try {
            const { doc, setDoc } = await import('firebase/firestore')
            await setDoc(doc($db, 'tasks', taskId), { status }, { merge: true })
            await fetchTasks()
        } catch (e) {
            console.error(e)
            toast.error('Failed to update status')
        }
    }

    const archiveTask = async (task: DeveloperTask) => {
        if (!task.id) return
        try {
            const { doc, setDoc, deleteDoc, serverTimestamp } = await import('firebase/firestore')

            await setDoc(doc($db, 'archived_tasks', task.id), {
                ...task,
                archivedAt: serverTimestamp()
            })
            await deleteDoc(doc($db, 'tasks', task.id))
            tasks.value = tasks.value.filter(t => t.id !== task.id)
            toast.success('Task archived')
        } catch (e) {
            console.error(e)
            toast.error('Failed to archive task')
        }
    }

    const deleteTask = async (taskId: string) => {
        if (!confirm('Delete task?')) return
        try {
            const { doc, deleteDoc } = await import('firebase/firestore')
            await deleteDoc(doc($db, 'tasks', taskId))
            tasks.value = tasks.value.filter(t => t.id !== taskId)
            toast.success('Task deleted')
        } catch (e) {
            console.error(e)
            toast.error('Failed to delete task')
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-600 font-bold'
            case 'med': return 'text-orange-500 font-bold'
            case 'low': return 'text-blue-500 font-medium'
            default: return 'text-muted'
        }
    }

    return {
        tasks,
        newTask,
        uploading,
        fetchTasks,
        submitTask,
        updateTaskStatus,
        archiveTask,
        deleteTask,
        getPriorityColor
    }
}
