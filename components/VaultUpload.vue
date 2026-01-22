<script setup lang="ts">
// Define the shape of the data we expect back from our server
interface UploadResponse {
  uploadUrl: string
  key: string
}

const uploading = ref(false)
const uploadProgress = ref(0) // (Optional) For a progress bar
const fileInput = ref<HTMLInputElement | null>(null)
const toast = useToast()

// 1. The Trigger
const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
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

    toast.success('Upload Complete!')
    
  } catch (error) {
    console.error('Upload failed:', error)
    toast.error('Something went wrong during upload.')
  } finally {
    uploading.value = false
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
</script>

<template>
  <div class="p-6 border rounded-lg bg-white shadow-sm transition-colors duration-200" :class="{ 'bg-gray-50': uploading }">
    <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold">Upload Exclusive Content</h3>
        <span v-if="uploading" class="text-xs font-mono text-indigo-600 animate-pulse">UPLOADING...</span>
    </div>

    <div class="relative">
        <div v-if="uploading" class="absolute inset-0 z-10 bg-white/50 flex items-center justify-center backdrop-blur-sm rounded">
            <div class="flex items-center gap-2 text-indigo-600 font-medium">
                <div class="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Securing in Vault...</span>
            </div>
        </div>

        <div>
            <label for="vault-upload" class="block mb-2 text-sm font-medium text-gray-700">Select Image or Audio</label>
            <input
                id="vault-upload"
                ref="fileInput"
                type="file"
                accept="image/*,audio/*"
                @change="handleFileChange"
                :disabled="uploading"
                class="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100
                disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            />
            <p class="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <span class="text-green-500">🔒</span> Files are stored in the private R2 Vault. No public access.
            </p>
        </div>
    </div>
  </div>
</template>
