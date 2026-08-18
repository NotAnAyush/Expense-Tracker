# ADR-013: Local Voice AI Engine & Sovereign On-Demand Modular Intelligence Hub

## Status
**ACCEPTED** (2026-08-18)

## Context
1. **1-Second Voice Disconnect Flaw**: Traditional browser `webkitSpeechRecognition` implementations abort immediately after brief acoustic pauses or network hiccups without watchdog recovery.
2. **Lack of Visual Feedback**: Users lacked acoustic amplitude and frequency feedback during speech input.
3. **Monolithic AI Dependencies**: Embedding all local AI weights in initial bundle bloats app load times.

## Decision
1. **Continuous Resilient Voice Engine**: Integrated `continuous: true`, auto-restart watchdog, silence debouncer, and state machine lifecycle in `VoiceQuickLogModal.jsx`.
2. **Live 24-Band Web Audio API Visualizer**: Implemented real-time FFT frequency spectrum analysis with 24 equalizer bars and decibel pulse ring.
3. **Multilingual Accent Switcher**: Provided accent selector for Indian English (`en-IN`), US (`en-US`), British (`en-GB`), Hindi (`hi-IN`), etc.
4. **Multi-Entity Financial NLP Parser**: Built regex and semantic parser in `localVoiceAiService.js` for currencies, amounts, categories, and payment modes.
5. **On-Demand Local AI Model Hub**: Added 7th studio tab in `CustomizationPage.jsx` (`LocalAiModelStudio.jsx`) to manage, benchmark, download, and purge sovereign weights.

## Consequences
- Zero premature voice log disconnections.
- Beautiful cyberpunk audio equalizer feedback.
- Modular on-demand model storage.
