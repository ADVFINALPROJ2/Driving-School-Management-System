# Frontend Documentation — Driving School Management System

## Overview

The frontend is a Next.js 16 application built with the App Router, TypeScript, and Tailwind CSS v4. It serves as an admin panel for registering new students in the driving school management system.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + `tailwindcss-animate` |
| UI Components | Custom shadcn-style primitives (Radix UI based) |
| Forms | `react-hook-form` + `@hookform/resolvers` + `zod` |
| Animations | `framer-motion` |
| Notifications | `sonner` |
| Icons | `lucide-react` |
| Class Utility | `clsx` + `tailwind-merge` (via `cn()`) |

---

## Project Structure

```
Client/
├── public/                          # Static assets (favicon, SVGs)
├── src/
│   ├── app/
│   │   ├── globals.css              # Theme variables, Tailwind base
│   │   ├── layout.tsx               # Root layout (fonts, Toaster)
│   │   └── page.tsx                 # Admin "Add Student" page
│   ├── components/
│   │   ├── ui/                      # shadcn-style primitives
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── select.tsx
│   │   │   └── separator.tsx
│   │   ├── async-state.tsx          # Loading, Error, 404 state components
│   │   ├── file-upload.tsx          # Drag-and-drop file upload with preview
│   │   └── student-form.tsx         # Main multi-step student registration form
│   └── lib/
│       ├── api.ts                   # Rails API client
│       ├── utils.ts                 # cn() utility
│       └── validations.ts           # Zod schemas, upload slot definitions
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── eslint.config.mjs
```

---

## Core Modules

### 1. `src/lib/utils.ts`

Exports a single `cn()` function that merges Tailwind class names using `clsx` and `tailwind-merge`. Use this on every component that accepts a `className` prop.

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 2. `src/lib/validations.ts`

Defines all form validation schemas and constants.

**`studentSchema`** (Zod object):
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `first_name` | string | Yes | 1-50 chars |
| `middle_name` | string | Yes | 1-50 chars |
| `last_name` | string | Yes | 1-50 chars |
| `date_of_birth` | string (YYYY-MM-DD) | Yes | Regex validated |
| `blood_type` | string | Yes | Must be A+, A-, B+, B-, AB+, AB-, O+, O- |
| `address` | string | Yes | 1-200 chars |
| `house_number` | string | Yes | 1-20 chars |
| `kebele` | string | No | Max 50 chars |
| `woreda` | string | Yes | 1-50 chars |
| `subcity` | string | No | Max 50 chars |
| `city` | string | Yes | 1-50 chars |
| `student_id` | string | Yes | 1-20 chars |
| `document_id` | string | Yes | 1-20 chars |
| `verified` | boolean | Yes | - |

**`UPLOAD_SLOTS`** — 6 document slots:
| Key | Label | Required | Type |
|-----|-------|----------|------|
| `profile_photo` | Profile Photo | Yes | Image only |
| `yellow_card` | Yellow Card | Yes | Image/PDF |
| `grade_8` | 8th Grade Document | Yes | Image/PDF |
| `grade_10` | 10th Grade Document | Yes | Image/PDF |
| `grade_12` | 12th Grade Document | Yes | Image/PDF |
| `medical` | Medical Document | No | Image/PDF |

**Constants:** `MAX_FILE_SIZE` (10MB), `ACCEPTED_IMAGE_TYPES`, `ACCEPTED_DOC_TYPES`, `BLOOD_TYPE_OPTIONS`.

### 3. `src/lib/api.ts`

API client for communicating with the Rails backend.

```ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
```

**`createStudent(formData: FormData): Promise<ApiResponse>`**
- Endpoint: `POST /api/v1/students`
- Content-Type: `multipart/form-data`
- Returns `{ success: boolean, data?: T, error?: string, errors?: Record<string, string[]> }`

### 4. `src/components/ui/*` — UI Primitives

These are shadcn-style components built on top of Radix UI primitives:

| Component | Radix Dependency | Features |
|-----------|-----------------|----------|
| `Button` | `@radix-ui/react-slot` | 6 variants (default, destructive, outline, secondary, ghost, link), 4 sizes |
| `Card` | - | Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| `Input` | - | Styled text input with focus ring and error state |
| `Label` | `@radix-ui/react-label` | Form label with peer-disabled styling |
| `Select` | `@radix-ui/react-select` | Full select with scroll buttons, portal, and animations |
| `Badge` | - | 5 variants (default, secondary, destructive, outline, success, warning) |
| `Separator` | `@radix-ui/react-separator` | Horizontal and vertical orientation |
| `Progress` | `@radix-ui/react-progress` | Animated progress bar |

### 5. `src/components/file-upload.tsx`

A reusable drag-and-drop file upload component.

**Props:**
- `slot: UploadSlot` — upload configuration (key, label, required, acceptImages)
- `files: Record<string, UploadedFile | null>` — current file state
- `onFileChange: (key, file) => void` — callback when file changes
- `errors` — field-level error messages

**Features:**
- Click or drag-and-drop to upload
- Image preview (base64 thumbnail)
- PDF file icon indicator
- Simulated progress bar during processing
- File size display
- Remove file button
- Per-slot accepted MIME types
- Framer Motion enter/exit animations

### 6. `src/components/student-form.tsx` — Main Form

A 3-step wizard form for creating a new student record.

**Steps:**
1. **Student Info** — Full name, DOB, blood type, address (street, house number, kebele, woreda, subcity, city), student ID, document ID, verification status
2. **Documents** — 6 file upload slots in a 2-column grid
3. **Review & Submit** — Summary of all entered data + document badges before final submission

**State Management:**
- `react-hook-form` with `zodResolver` for text fields
- Local `uploadedFiles` state for file management
- Server error display in the review step
- Success state with animated confirmation
- Form reset after successful submission

### 7. `src/components/async-state.tsx`

Reusable components for handling asynchronous UI states.

**Exported Components:**

| Component | Props | Purpose |
|-----------|-------|---------|
| `LoadingState` | `className?`, `message?` | Animated loading spinner with ping effect |
| `ErrorState` | `className?`, `message?`, `onRetry?` | Error display with optional retry button |
| `NotFoundState` | `className?`, `title?`, `message?`, `action?` | 404 page with optional action button |
| `AsyncWrapper` | `isLoading`, `error`, `onRetry?`, `children`, `loadingMessage?`, `errorMessage?` | Orchestrates loading/error/children states |

All components use `framer-motion` for entrance animations.

---

## Theme System

The app uses CSS custom properties defined in `globals.css` with both light and dark variants.

**Light mode (default):** White backgrounds, dark text, oklch color space.
**Dark mode:** Activated via `.dark` class on a parent element.

CSS variables follow the shadcn convention:
- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`
- `--radius`

---

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Base URL for the Rails API |

---

## Available Scripts

```bash
npm run dev       # Start development server (Turbopack)
npm run build     # Production build
npm start         # Start production server
npm run lint      # Run ESLint
```

---

## Key Design Decisions

1. **Multi-step form** — Separates personal info from document uploads to reduce cognitive load and improve mobile usability.
2. **Client-side file preview** — Images are read as data URLs for instant preview. PDFs show an icon instead (PDF rendering in the browser is deferred to the backend).
3. **Simulated progress** — The file upload component shows a brief progress animation for UX polish. Real progress tracking should be added when the actual API integration is complete.
4. **Zod validation** — All form fields are validated client-side before submission. File validation (type, size) happens separately before building the FormData.
5. **Sonner for toasts** — Lightweight, accessible toast notifications for success/error feedback.
6. **CSS variables for theming** — Allows runtime theme switching without recompiling Tailwind.
7. **No `"use client"` on page.tsx** — The page remains a Server Component; only the `StudentForm` and interactive components are client components.

---

## API Contract

### POST /api/v1/students

**Content-Type:** `multipart/form-data`

**Fields (under `student[...]` prefix):**
```
student[first_name]        (string, required)
student[middle_name]       (string, required)
student[last_name]         (string, required)
student[date_of_birth]     (string, YYYY-MM-DD, required)
student[blood_type]        (string, required)
student[address]           (string, required)
student[house_number]      (string, required)
student[kebele]            (string, optional)
student[woreda]            (string, required)
student[subcity]           (string, optional)
student[city]              (string, required)
student[student_id]        (string, required)
student[document_id]       (string, required)
student[verified]          (boolean, default: false)
```

**Files (under `student[...]` prefix):**
```
student[profile_photo]     (file, required)
student[yellow_card]       (file, required)
student[grade_8]           (file, required)
student[grade_10]          (file, required)
student[grade_12]          (file, required)
student[medical]           (file, optional)
```

---

## Styling Conventions

- Use `cn()` for all conditional class merging
- Prefer Tailwind utility classes over custom CSS
- Use CSS variables via `@apply` in `@layer base` for global resets
- Animations use `framer-motion` with consistent durations (200ms for step transitions, 300ms for progress)
- Error states use `border-destructive` on inputs + `text-destructive` on messages
- Success states use emerald-600/400 for positive feedback
