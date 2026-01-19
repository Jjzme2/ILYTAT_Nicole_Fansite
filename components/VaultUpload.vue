<script setup lang="ts">
// Define the shape of the data we expect back from our server
interface UploadResponse {
  uploadUrl: string
  key: string
}

const uploading = ref(false)
const uploadProgress = ref(0) // (Optional) For a progress bar
const fileInput = ref<HTMLInputElement | null>(null)

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

    alert('Upload Complete!')
    
  } catch (error) {
    console.error('Upload failed:', error)
    alert('Something went wrong.')
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
  <div class="p-6 border rounded-lg bg-white shadow-sm">
    <h3 class="text-lg font-bold mb-4">Upload Exclusive Content</h3>
    
    <div v-if="uploading" class="text-center py-8">
      <div class="animate-spin text-4xl mb-2">⏳</div>
      <p class="text-gray-500">Uploading securely to Vault...</p>
    </div>

    <div v-else>
      <label class="block mb-2 text-sm font-medium text-gray-700">Select Image or Audio</label>
      <input 
        ref="fileInput"
        type="file" 
        accept="image/*,audio/*"
        @change="handleFileChange"
        class="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-indigo-50 file:text-indigo-700
          hover:file:bg-indigo-100"
      />
      <p class="mt-2 text-xs text-gray-500">
        Files are stored in the private R2 Vault. No public access.
      </p>
    </div>
  </div>
</template>