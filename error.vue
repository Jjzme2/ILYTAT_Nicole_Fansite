<template>
  <div class="min-h-screen bg-[#0B0C15] text-white flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-indigo-500/30">
    
    <!-- Animated Background Stars -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div v-for="i in 50" :key="i" 
            class="absolute rounded-full bg-white animate-pulse"
            :style="{
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                width: Math.random() * 3 + 'px',
                height: Math.random() * 3 + 'px',
                opacity: Math.random() * 0.7,
                animationDuration: Math.random() * 3 + 2 + 's'
            }"
        ></div>
    </div>

    <!-- Glowing Orb Effect -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none pulsing-glow"></div>

    <!-- Main Content -->
    <div class="relative z-10 text-center px-6 max-w-2xl">
        
        <!-- Glitch 404 -->
        <div class="relative mb-8 group">
            <h1 class="text-[150px] md:text-[200px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/5 select-none glitch-text" data-text="404">
                404
            </h1>
            <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-100 mix-blend-screen pointer-events-none">
                <Rocket class="w-32 h-32 text-indigo-500 animate-bounce-slow" />
            </div>
        </div>

        <h2 class="text-3xl md:text-4xl font-bold mb-4 font-serif text-indigo-200">
            Lost in the Void
        </h2>
        
        <p class="text-gray-400 text-lg mb-10 leading-relaxed max-w-md mx-auto">
            The coordinates you entered seem to lead nowhere. Let's get you back to safety before the oxygen runs out.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button @click="handleClearError" class="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] flex items-center gap-2">
                <Home class="w-5 h-5 transition-transform group-hover:-translate-y-1" />
                Return to Base
            </button>
            
            <button @click="back" class="px-8 py-4 rounded-full font-bold text-lg text-white border border-white/10 hover:bg-white/5 transition flex items-center gap-2 backdrop-blur-sm">
                <ArrowLeft class="w-5 h-5" />
                Go Back
            </button>
        </div>

        <!-- Debug Info (Optional, small at bottom) -->
        <div v-if="error" class="mt-16 p-4 rounded-lg bg-white/5 border border-white/10 text-left text-xs font-mono text-gray-500 max-w-lg mx-auto backdrop-blur-md">
            <div class="font-bold text-red-400 mb-1 flex items-center gap-2">
                <AlertCircle class="w-3 h-3" /> Error Details:
            </div>
            <p>{{ error.message || 'Unknown error occurred.' }}</p>
            <p class="mt-1 opacity-50">Status: {{ error.statusCode }}</p>
        </div>

    </div>

    <!-- Astronaut Floating (Decorative) -->
    <div class="absolute bottom-10 right-10 animate-float pointer-events-none opacity-50 hidden md:block">
        <Ghost class="w-24 h-24 text-indigo-300/20 rotate-12" />
    </div>

  </div>
</template>

<script setup>
import { Home, ArrowLeft, Rocket, AlertCircle, Ghost } from 'lucide-vue-next'

const props = defineProps({
  error: Object
})

const handleError = () => clearError({ redirect: '/' })

const handleClearError = () => {
    // Navigate home and clear the error
    clearError({ redirect: '/' })
}

const back = () => {
    window.history.back()
}
</script>

<style scoped>
.pulsing-glow {
    animation: pulse-glow 8s infinite alternate;
}

@keyframes pulse-glow {
    from { opacity: 0.3; transform: translate(-50%, -50%) scale(0.9); }
    to { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
}

.animate-bounce-slow {
    animation: bounce 3s infinite;
}

.animate-float {
    animation: float 6s ease-in-out infinite;
}

@keyframes float {
    0% { transform: translateY(0px) rotate(12deg); }
    50% { transform: translateY(-20px) rotate(15deg); }
    100% { transform: translateY(0px) rotate(12deg); }
}

/* Glitch Effect CSS */
.glitch-text {
    position: relative;
}

.glitch-text::before,
.glitch-text::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #0B0C15;
}

.glitch-text::before {
    left: 2px;
    text-shadow: -1px 0 #00ffff;
    clip: rect(44px, 450px, 56px, 0);
    animation: glitch-anim 5s infinite linear alternate-reverse;
}

.glitch-text::after {
    left: -2px;
    text-shadow: -1px 0 #ff00ff;
    clip: rect(44px, 450px, 56px, 0);
    animation: glitch-anim2 5s infinite linear alternate-reverse;
}

@keyframes glitch-anim {
    0% { clip: rect(35px, 9999px, 86px, 0); }
    5% { clip: rect(63px, 9999px, 26px, 0); }
    10% { clip: rect(89px, 9999px, 2px, 0); }
    15% { clip: rect(3px, 9999px, 98px, 0); }
    20% { clip: rect(58px, 9999px, 83px, 0); }
    25% { clip: rect(25px, 9999px, 15px, 0); }
    30% { clip: rect(56px, 9999px, 41px, 0); }
    35% { clip: rect(12px, 9999px, 68px, 0); }
    40% { clip: rect(48px, 9999px, 29px, 0); }
    45% { clip: rect(81px, 9999px, 5px, 0); }
    50% { clip: rect(22px, 9999px, 92px, 0); }
    55% { clip: rect(67px, 9999px, 36px, 0); }
    60% { clip: rect(95px, 9999px, 11px, 0); }
    65% { clip: rect(42px, 9999px, 75px, 0); }
    70% { clip: rect(18px, 9999px, 53px, 0); }
    75% { clip: rect(84px, 9999px, 21px, 0); }
    80% { clip: rect(51px, 9999px, 64px, 0); }
    85% { clip: rect(9px, 9999px, 88px, 0); }
    90% { clip: rect(76px, 9999px, 47px, 0); }
    95% { clip: rect(33px, 9999px, 95px, 0); }
    100% { clip: rect(61px, 9999px, 14px, 0); }
}

@keyframes glitch-anim2 {
    0% { clip: rect(12px, 9999px, 58px, 0); }
    5% { clip: rect(86px, 9999px, 23px, 0); }
    10% { clip: rect(41px, 9999px, 96px, 0); }
    15% { clip: rect(69px, 9999px, 9px, 0); }
    20% { clip: rect(27px, 9999px, 71px, 0); }
    25% { clip: rect(93px, 9999px, 45px, 0); }
    30% { clip: rect(52px, 9999px, 84px, 0); }
    35% { clip: rect(16px, 9999px, 37px, 0); }
    40% { clip: rect(78px, 9999px, 62px, 0); }
    45% { clip: rect(34px, 9999px, 19px, 0); }
    50% { clip: rect(91px, 9999px, 55px, 0); }
    55% { clip: rect(59px, 9999px, 82px, 0); }
    60% { clip: rect(24px, 9999px, 48px, 0); }
    65% { clip: rect(72px, 9999px, 13px, 0); }
    70% { clip: rect(46px, 9999px, 98px, 0); }
    75% { clip: rect(89px, 9999px, 32px, 0); }
    80% { clip: rect(13px, 9999px, 66px, 0); }
    85% { clip: rect(65px, 9999px, 28px, 0); }
    90% { clip: rect(98px, 9999px, 51px, 0); }
    95% { clip: rect(39px, 9999px, 73px, 0); }
    100% { clip: rect(75px, 9999px, 91px, 0); }
}
</style>
