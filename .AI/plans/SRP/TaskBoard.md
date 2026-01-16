# SRP Refactoring Plan: Task Management System

## Objective
Extract the "Dev Board" (Task Management) functionality from the monolithic `pages/admin.vue` into a standalone system. This will improve maintainability, allow for easier reuse (e.g., in a separate "Engineering" dashboard), and strictly adhere to SRP by separating "Page" logic from "Feature" logic.

## Analysis
**Current Location:** `pages/admin.vue`
**Coupling:** High. The task state (`tasks`, `newTask`) and actions (`submitTask`, `updateTaskStatus`, etc.) are mixed with general admin logic.
**Dependencies:**
- Firebase Firestore (`collection`, `addDoc`, `deleteDoc`, `updateDoc`, `query`, `orderBy`, `serverTimestamp`)
- Lucide Icons (`Zap`, `Bug`, `Hammer`, `Check`, `Archive`, `Trash2`, `Clipboard`)
- `utils/taskMarkdown` (`generateMarkdown`)
- Toast notifications (`useToast`)

## Migration Strategy

### 1. Logic Extraction (`useTaskBoard`)
Create a composable that encapsulates the *business logic* of managing tasks.
**File:** `composables/useTaskBoard.ts`
**Interface:**
```typescript
interface Task {
    id: string
    title: string
    type: 'feature' | 'bug' | 'design' | 'chore'
    priority: 'high' | 'med' | 'low'
    status: 'todo' | 'in_progress' | 'done'
    section: string
    // ... other fields
}

export const useTaskBoard = () => {
    const tasks: Ref<Task[]>
    const loading: Ref<boolean>
    const fetchTasks: () => Promise<void>
    const createTask: (task: Omit<Task, 'id'>) => Promise<void>
    const updateTaskStatus: (id: string, status: string) => Promise<void>
    const deleteTask: (id: string) => Promise<void>
    const archiveTask: (task: Task) => Promise<void>
    const copyToClipboard: () => Promise<void>
}
```

### 2. UI Extraction (`AdminTaskBoard`)
Create a self-contained component that consumes the composable.
**File:** `components/admin/TaskBoard.vue`
**Responsibility:** Render the board, handle form inputs, and invoke composable actions.
**Props:** None required (autonomous).

### 3. Integration
1.  Create the files above.
2.  Import `AdminTaskBoard` in `pages/admin.vue`.
3.  Delete the legacy code in `pages/admin.vue` (HTML template section and Script section).
4.  Replace the template section with `<AdminTaskBoard />`.

## Rollback Plan
1.  Git revert the changes to `pages/admin.vue`.
2.  Delete the new files.

## Implementation Steps
1.  **Create Composable**: `composables/useTaskBoard.ts` containing the standard Firestore CRUD logic currently in `admin.vue`.
2.  **Create Component**: `components/admin/TaskBoard.vue` containing the HTML structure from lines ~694-802 of `admin.vue`.
3.  **Refactor Parent**: Update `pages/admin.vue` to remove the extracted logic and insert the component.

