# Cadence Studio

> High-performance meeting intelligence workspace featuring decoupled 60 FPS audio waveform scrubbing, bidirectional word-level transcript synchronization, and an agentic post-meeting automation canvas.

[![CI](https://github.com/xdnzz/cadence-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/xdnzz/cadence-studio/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16_%28App_Router%29-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-Unit_Tested-729B1B.svg)](https://vitest.dev/)

**Live Demo:** [cadence-studio-two.vercel.app](https://cadence-studio-two.vercel.app)

---

## Engineering Overview

Meeting intelligence interfaces often suffer from UI lag caused by tying high-frequency audio playback events directly to the primary React component tree. Cadence Studio solves this through an uncoupled architecture designed for 60 FPS rendering, strict type contracts, and zero layout shift.

### Key Architectural Pillars

* **Decoupled Waveform Canvas Engine:** Rather than relying on heavy third-party audio wrappers or spawning hundreds of DOM nodes, waveforms render via native HTML5 Canvas using peak-downsampling algorithms (`extractNormalizedPeaks`). High-DPI displays are accounted for using `window.devicePixelRatio` scaling, maintaining razor-sharp visuals on Retina screens.
* **Partitioned State Architecture:** Playback state is segregated in Zustand. High-frequency audio playback intervals operate through independent subscribers and `requestAnimationFrame`, preventing expensive reconciliation cycles across the transcript and workflow layers.
* **Bidirectional Word Sync & Intelligent Scroll:** Clicking any individual word or key takeaway instantly seeks the audio engine to that exact millisecond. The active word is tracked and kept centered in the viewport, automatically yielding control if the user initiates manual wheel or touch scrolling.
* **Optimistic Workflow Pipeline:** Action items and automated workflow nodes update optimistically in client state, delivering instant tactile feedback with built-in rollback resilience.

---

## Tech Stack

* **Framework:** Next.js 16 (React 19, App Router)
* **Language:** TypeScript (Strict mode enabled)
* **State Management:** Zustand 5 (Partitioned slices)
* **Styling & Design System:** Tailwind CSS v4, Radix UI Primitives, Lucide Icons
* **Audio & Visualization:** Web Audio API, Canvas API
* **AI & Streaming:** Vercel AI SDK
* **Testing:** Vitest, React Testing Library, JSDOM
* **CI/CD:** GitHub Actions (Lint, Typecheck, Test, Build), Vercel

---

## Project Structure

```text
src/
├── app/                  # Next.js App Router root layout and views
├── components/
│   ├── audio/            # Waveform Canvas, player controls, upload, timeline scrubbing
│   ├── transcript/       # Interactive transcript, search filtering, word highlights
│   ├── intelligence/     # Executive summary, takeaways, action items
│   └── workflow/         # Directed automation canvas and task nodes
├── fixtures/             # Sample meeting data
├── hooks/                # Audio engine, transcript sync, keyboard navigation
├── stores/               # Zustand state slices (Audio, Transcript, Intelligence, Workflow)
├── types/                # Domain type contracts
├── lib/                  # Pure math utilities, audio decoders, formatters
└── test/                 # Test setup
```
