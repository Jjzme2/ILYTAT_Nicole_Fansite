<script setup lang="ts">
import { UploadCloud, CheckCircle, AlertCircle, Loader2, File as FileIcon, X } from 'lucide-vue-next'

// Define the shape of the data we expect back from our server
interface UploadResponse {
  uploadUrl: string
  key: string
}

const toast = useToast()

const uploading = ref(false)
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)

// 1. The Trigger
const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  await processFile(input.files[0])
}

const handleDrop = async (event: DragEvent) => {
    isDragging.value = false
    const files = event.dataTransfer?.files
    if (files?.length) {
        await processFile(files[0])
    }
}

const processFile = async (file: File) => {
  selectedFile.value = file
  uploading.value = true

  try {
    // Step A: Get the "Permission Slip" (Signed URL) from Nuxt
    const { uploadUrl, key } = await $fetch<UploadResponse>('/api/vault/upload', {
      method: 'POST',
      body: {
        filename: file.name,
        contentType: file.type
      }
    })

    // Step B: Upload DIRECTLY to Cloudflare R2 (Bypassing Heroku)
    // We use standard fetch here. 
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    })

    // Step C: Save the "Receipt" to Firestore
    // We don't save the file, just the 'key' (ID)
    await saveToFirestore(key, file)

    toast.success('Upload Complete!', { label: 'View', onClick: () => {} })
    
  } catch (error) {
    console.error('Upload failed:', error)
    toast.error('Upload failed. Please try again.')
  } finally {
    uploading.value = false
    selectedFile.value = null
    if (fileInput.value) fileInput.value.value = '' // Reset input
  }
}

// 2. The Database Record
const saveToFirestore = async (key: string, file: File) => {
  // Call your Nuxt API to save the metadata
  await $fetch('/api/posts/create', {
    method: 'POST',
    body: {
      title: file.name, // Or a custom title input
      storageKey: key,  // CRITICAL: This is how we find the file later
      mediaType: file.type.startsWith('audio') ? 'audio' : 'image',
      isExclusive: true, // Mark as paid content
      createdAt: new Date()
    }
  })
}

const openFileDialog = () => {
    if (!uploading.value) {
        fileInput.value?.click()
    }
}
</script>

<template>
  <div class="p-6 border rounded-xl bg-white shadow-sm transition-all duration-300">
    <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
        <UploadCloud class="w-5 h-5 text-indigo-600" />
        Upload Exclusive Content
    </h3>
    
    <div
        class="relative group cursor-pointer border-2 border-dashed rounded-xl transition-all duration-300 p-8 text-center"
        :class="[
            isDragging ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50',
            uploading ? 'pointer-events-none opacity-80' : ''
        ]"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="openFileDialog"
        role="button"
        tabindex="0"
        aria-label="Upload file area. Drag and drop or click to select."
        @keydown.enter="openFileDialog"
        @keydown.space.prevent="openFileDialog"
    >
        <div v-if="uploading" class="flex flex-col items-center justify-center py-4">
            <Loader2 class="w-10 h-10 text-indigo-600 animate-spin mb-3" />
            <p class="text-indigo-900 font-medium animate-pulse">Uploading {{ selectedFile?.name }}...</p>
        </div>

        <div v-else class="flex flex-col items-center justify-center space-y-3">
             <div class="p-3 bg-indigo-50 text-indigo-600 rounded-full group-hover:scale-110 transition-transform duration-300">
                <UploadCloud class="w-8 h-8" />
             </div>
             <div>
                <p class="text-base font-medium text-gray-900">
                    <span class="text-indigo-600 hover:underline">Click to upload</span> or drag and drop
                </p>
                <p class="text-sm text-gray-500 mt-1">Images or Audio (MP3, WAV)</p>
             </div>
        </div>

        <input
            ref="fileInput"
            type="file"
            accept="image/*,audio/*"
            @change="handleFileChange"
            class="hidden"
            aria-hidden="true"
        />
    </div>

    <div class="mt-4 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
        <AlertCircle class="w-4 h-4 shrink-0" />
        <p>Files are stored securely in the Vault. No public access.</p>
    </div>
  </div>
</template>
