<template>
  <div class="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-3xl bg-black rounded-2xl overflow-hidden border border-gray-800 relative flex flex-col max-h-[90vh]">
        
        <!-- Header -->
        <div class="p-4 flex justify-between items-center border-b border-gray-800">
            <h3 class="font-bold text-white capitalize flex items-center gap-2">
                <span v-if="mode === 'photo'">📸 Take Photo</span>
                <span v-if="mode === 'video'">🎥 Record Video</span>
                <span v-if="mode === 'audio'">🎙️ Record Audio</span>
            </h3>
            <button @click="$emit('cancel')" class="text-gray-400 hover:text-white">
                <X class="w-6 h-6" />
            </button>
        </div>

        <!-- Viewport -->
        <div class="flex-1 bg-gray-900 relative flex items-center justify-center overflow-hidden min-h-[400px]">
            <!-- Video Preview (Photo/Video mode) -->
            <video 
                v-if="['photo', 'video'].includes(mode) && !capturedUrl" 
                ref="videoPreview" 
                autoplay 
                muted 
                playsinline
                class="w-full h-full object-cover"
            ></video>

            <!-- Audio Visualization Placeholder -->
            <div v-if="mode === 'audio' && !capturedUrl" class="text-center">
                 <div class="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mb-4 transition-all duration-300" :class="{ 'scale-110 bg-red-500/40': isRecording }">
                    <Mic class="w-10 h-10 text-red-500" />
                 </div>
                 <p class="text-gray-400 font-mono text-xl">{{ formatTime(timer) }}</p>
                 <p class="text-xs text-gray-500 mt-2" v-if="isRecording">Recording...</p>
                 <p class="text-xs text-gray-500 mt-2" v-else>Ready</p>
            </div>

            <!-- Result Preview -->
            <div v-if="capturedUrl" class="w-full h-full flex flex-col items-center justify-center">
                <img v-if="mode === 'photo'" :src="capturedUrl" class="max-h-full max-w-full object-contain" />
                <video v-if="mode === 'video'" :src="capturedUrl" controls class="max-h-full max-w-full" ></video>
                <audio v-if="mode === 'audio'" :src="capturedUrl" controls class="w-full max-w-md"></audio>
            </div>

            <!-- Canvas for capturing photo frames (Hidden) -->
            <canvas ref="canvas" class="hidden"></canvas>
        </div>

        <!-- Controls -->
        <div class="p-6 bg-gray-950 border-t border-gray-800 flex justify-center gap-6 items-center">
            
            <!-- CAPTURE ACTIONS -->
            <template v-if="!capturedUrl">
                <!-- PHOTO -->
                <button 
                    v-if="mode === 'photo'" 
                    @click="takePhoto"
                    class="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:bg-white/10 transition"
                >
                    <div class="w-12 h-12 bg-white rounded-full"></div>
                </button>

                <!-- VIDEO/AUDIO -->
                <button 
                    v-if="['video', 'audio'].includes(mode)" 
                    @click="toggleRecording"
                    class="w-16 h-16 rounded-full border-4 flex items-center justify-center transition"
                    :class="isRecording ? 'border-red-500' : 'border-white'"
                >
                    <div 
                        class="rounded transition-all duration-300"
                        :class="isRecording ? 'w-6 h-6 bg-red-500' : 'w-12 h-12 bg-red-600 rounded-full'"
                    ></div>
                </button>
            </template>

            <!-- REVIEW ACTIONS -->
            <template v-else>
                <button @click="reset" class="px-6 py-3 rounded-full bg-gray-800 text-white font-medium hover:bg-gray-700">
                    Retake
                </button>
                <button @click="confirm" class="px-8 py-3 rounded-full bg-white text-black font-bold hover:scale-105 transition flex items-center gap-2">
                    <Check class="w-5 h-5" />
                    Use {{ mode === 'audio' ? 'Recording' : (mode === 'video' ? 'Video' : 'Photo') }}
                </button>
            </template>

        </div>
    </div>
  </div>
</template>

<script setup>
import { X, Mic, Check } from 'lucide-vue-next'

const props = defineProps({
    mode: { type: String, required: true } // 'photo' | 'video' | 'audio'
})

const emit = defineEmits(['capture', 'cancel'])

const videoPreview = ref(null)
const canvas = ref(null)
const stream = ref(null)
const mediaRecorder = ref(null)
const chunks = ref([])
const isRecording = ref(false)
const timer = ref(0)
const timerInterval = ref(null)

const capturedUrl = ref(null)
const capturedBlob = ref(null)

// --- Lifecycle ---
onMounted(async () => {
    await initStream()
})

onUnmounted(() => {
    stopStream()
})

// --- Stream Management ---
const initStream = async () => {
    try {
        const constraints = {
            audio: true,
            video: props.mode !== 'audio' 
                ? { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
                : false
        }
        
        stream.value = await navigator.mediaDevices.getUserMedia(constraints)
        
        if (videoPreview.value && props.mode !== 'audio') {
            videoPreview.value.srcObject = stream.value
        }
    } catch (e) {
        console.error("Camera/Mic access denied:", e)
        alert("Please allow camera/microphone access.")
        emit('cancel')
    }
}

const stopStream = () => {
    if (stream.value) {
        stream.value.getTracks().forEach(track => track.stop())
        stream.value = null
    }
    clearInterval(timerInterval.value)
}

// --- Photo Logic ---
const takePhoto = () => {
    if (!videoPreview.value || !canvas.value) return

    const video = videoPreview.value
    const ctx = canvas.value.getContext('2d')
    
    canvas.value.width = video.videoWidth
    canvas.value.height = video.videoHeight
    
    // Flip horizontal if using user-facing camera (optional, standard mirror effect)
    ctx.translate(canvas.value.width, 0)
    ctx.scale(-1, 1)
    
    ctx.drawImage(video, 0, 0, canvas.value.width, canvas.value.height)
    
    canvas.value.toBlob((blob) => {
        capturedBlob.value = blob
        capturedUrl.value = URL.createObjectURL(blob)
        stopStream() // Stop camera to freeze preview/save battery
    }, 'image/jpeg', 0.9)
}

// --- Recording Logic (Video/Audio) ---
const toggleRecording = () => {
    if (isRecording.value) {
        stopRecording()
    } else {
        startRecording()
    }
}

const recordingMimeType = ref('')

const getSupportedMimeType = () => {
    const types = props.mode === 'audio' 
        ? ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'] 
        : ['video/mp4', 'video/webm;codecs=vp9', 'video/webm']
    
    for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
            return type
        }
    }
    return '' // Let browser default
}

const startRecording = () => {
    chunks.value = []
    
    // Determine best mime type
    const mimeType = getSupportedMimeType()
    recordingMimeType.value = mimeType
    
    const options = mimeType ? { mimeType } : undefined
    
    try {
        mediaRecorder.value = new MediaRecorder(stream.value, options)
    } catch (e) {
        console.warn('MediaRecorder failed with options, trying default', e)
        mediaRecorder.value = new MediaRecorder(stream.value)
        recordingMimeType.value = '' // Fallback to default
    }
    
    mediaRecorder.value.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.value.push(e.data)
    }
    
    mediaRecorder.value.onstop = () => {
        // Use the actual mime type we recorded with, or a generic fallback
        const type = recordingMimeType.value || (props.mode === 'audio' ? 'audio/webm' : 'video/webm')
        capturedBlob.value = new Blob(chunks.value, { type })
        capturedUrl.value = URL.createObjectURL(capturedBlob.value)
        stopStream()
    }
    
    mediaRecorder.value.start()
    isRecording.value = true
    
    // Timer
    timer.value = 0
    timerInterval.value = setInterval(() => {
        timer.value++
    }, 1000)
}

const stopRecording = () => {
    if (mediaRecorder.value && isRecording.value) {
        mediaRecorder.value.stop()
        isRecording.value = false
        clearInterval(timerInterval.value)
    }
}

// --- Actions ---
const reset = async () => {
    if (capturedUrl.value) {
        URL.revokeObjectURL(capturedUrl.value)
    }
    capturedUrl.value = null
    capturedBlob.value = null
    await initStream()
}

const confirm = () => {
    if (capturedBlob.value) {
        emit('capture', {
            blob: capturedBlob.value,
            url: capturedUrl.value,
            type: props.mode 
        })
    }
}

const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
}
</script>
