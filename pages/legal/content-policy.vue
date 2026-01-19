<template>
    <div class="min-h-screen bg-background text-text p-6 md:p-12">
        <div class="max-w-4xl mx-auto">
            
            <header class="mb-12 pb-6 border-b border-border flex justify-between items-center">
                <div>
                     <h1 class="text-4xl font-serif font-bold text-primary">Transparency & Policy</h1>
                     <p class="text-muted mt-2">Community Guidelines, Content Policy, and Conduct Code</p>
                </div>
                <div class="flex gap-4">
                     <NuxtLink to="/profile" class="px-4 py-2 bg-surface border border-border rounded-lg hover:border-primary text-sm font-bold text-text transition">
                        Back to Profile
                    </NuxtLink>
                </div>
            </header>

            <div class="space-y-12">
                
                <!-- 21+ Policy -->
                <section class="bg-surface p-8 rounded-2xl border border-border shadow-sm">
                    <div class="flex items-start gap-4">
                        <div class="p-3 bg-red-500/10 rounded-xl text-red-500">
                            <ShieldAlert class="w-8 h-8" />
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold mb-4">21+ Age Requirement</h2>
                            <p class="leading-relaxed text-muted">
                                ILYTAT FANS is strictly for individuals aged <strong>21 years or older</strong>. 
                                By accessing this platform, you affirm that you meet this age requirement. 
                                We implemented this policy to ensure a mature community environment suitable for the themes discussed and portrayed.
                            </p>
                        </div>
                    </div>
                </section>

                <!-- Content Guidelines -->
                <section class="grid md:grid-cols-2 gap-8">
                    <div class="bg-surface p-8 rounded-2xl border border-border shadow-sm">
                        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                             <Ban class="w-5 h-5 text-primary" />
                            No Nudity Policy
                        </h2>
                        <p class="text-muted mb-4">
                            This platform maintains a strict <strong>NO NUDITY</strong> policy. 
                            While we celebrate aesthetic and artistic expression, explicit sexual content and nudity are prohibited. 
                        </p>
                         <p class="text-muted">
                            All content is curated to be safe for work (SFW) while maintaining a premium, exclusive feel.
                        </p>
                    </div>

                    <div class="bg-surface p-8 rounded-2xl border border-border shadow-sm">
                        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                            <Cigarette class="w-5 h-5 text-primary" />
                            Adult Themes
                        </h2>
                        <p class="text-muted mb-4">
                            Content on this platform may depict adult themes and behaviors, including but not limited to <strong>the consumption of tobacco or smoking</strong>.
                        </p>
                        <p class="text-muted">
                            This content is intended for mature audiences only and should not be emulated by minors.
                        </p>
                    </div>
                </section>

                <!-- Community Conduct -->
                <section class="bg-surface p-8 rounded-2xl border border-border shadow-sm">
                    <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
                        <HeartHandshake class="w-5 h-5 text-primary" />
                        Community Code of Conduct
                    </h2>
                    
                    <div class="grid gap-4">
                        <div class="flex gap-4 items-start">
                            <CheckCircle2 class="w-5 h-5 text-green-500 shrink-0 mt-1" />
                            <div>
                                <h3 class="font-bold">Respect is Paramount</h3>
                                <p class="text-sm text-muted">Harassment, hate speech, bullying, or aggressive behavior towards Nicole or other community members will result in an immediate ban, <strong>regardless of subscription status</strong>.</p>
                            </div>
                        </div>
                        <div class="flex gap-4 items-start">
                             <CheckCircle2 class="w-5 h-5 text-green-500 shrink-0 mt-1" />
                            <div>
                                <h3 class="font-bold">Privacy & Consent</h3>
                                <p class="text-sm text-muted">Do not share private information (doxxing) or content from this platform externally without permission.</p>
                            </div>
                        </div>
                         <div class="flex gap-4 items-start">
                             <CheckCircle2 class="w-5 h-5 text-green-500 shrink-0 mt-1" />
                            <div>
                                <h3 class="font-bold">Constructive Interaction</h3>
                                <p class="text-sm text-muted">We encourage feedback and discussion, but keep it constructive. Trolling or bad-faith arguments are not welcome.</p>
                            </div>
                        </div>
                    </div>

                </section>

                <!-- Content Protection & Monitoring -->
                <section class="bg-surface p-8 rounded-2xl border border-border shadow-sm">
                    <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
                        <Lock class="w-5 h-5 text-primary" />
                        Content Protection & Privacy
                    </h2>
                    
                    <div class="space-y-4 text-muted">
                        <p>
                            To ensure the privacy of our creators and members is respected, and to minimize content being shared externally without authorization, <strong>we actively monitor and log content access and interactions</strong>.
                        </p>
                        <p>
                            If you attempt to download, screen-record, or otherwise capture content from this platform, we store this access information. This data is strictly used to enforce our terms of service and prevent leaks. 
                        </p>
                         <p class="p-4 bg-background border border-border rounded-xl text-sm font-bold text-text">
                            <span class="text-primary uppercase tracking-wide text-xs block mb-1">Security Notice</span>
                            Direct downloading of media is disabled on this platform. Circumventing these protections may result in account termination.
                        </p>
                    </div>
                </section>

            </div>

        </div>
    </div>
</template>

<script setup>
import { ShieldAlert, Ban, Cigarette, HeartHandshake, CheckCircle2, Lock } from 'lucide-vue-next'

useHead({
    title: 'Content Policy & Guidelines'
})
</script>
