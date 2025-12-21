# Bug Fix Documentation: Button Click Issues

**Date:** December 21, 2025
**Commit:** `d625cec`
**Severity:** Critical
**Status:** Resolved

---

## Executive Summary

All interactive buttons in the SQL Practice application were non-functional. Users could not switch difficulty levels, select challenges, run queries, or use any button-based functionality. The issue was caused by two separate bugs that together completely broke the application's interactivity.

---

## Issue 1: Svelte 5 Infinite Effect Loop

### Problem Description

The CodeMirror SQL editor component (`Editor.svelte`) caused an infinite reactivity loop that crashed Svelte's entire state management system. When this error occurred, no state updates could propagate through the application, making all buttons appear "dead" even though they were receiving click events.

### Actual Behavior

- Clicking any button produced no visible response
- Browser console showed error: `effect_update_depth_exceeded`
- Error message: "Maximum update depth exceeded. This typically indicates that an effect reads and writes the same piece of state"
- Stack trace pointed to `Editor.svelte` line 96

### Expected Behavior

- Buttons should respond to clicks
- State changes should propagate correctly
- No console errors during normal operation

### Root Cause Analysis

The `Editor.svelte` component had two `$effect` blocks that created a reactive dependency cycle:

```
┌─────────────────────────────────────────────────────────────────┐
│                     INFINITE LOOP DIAGRAM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────────┐                                          │
│   │ User types in    │                                          │
│   │ CodeMirror       │                                          │
│   └────────┬─────────┘                                          │
│            │                                                     │
│            ▼                                                     │
│   ┌──────────────────┐                                          │
│   │ changeListener   │  (EditorView.updateListener)             │
│   │ fires            │                                          │
│   └────────┬─────────┘                                          │
│            │                                                     │
│            ▼                                                     │
│   ┌──────────────────┐                                          │
│   │ Sets `value`     │  value = newValue;                       │
│   │ state            │                                          │
│   └────────┬─────────┘                                          │
│            │                                                     │
│            ▼                                                     │
│   ┌──────────────────┐                                          │
│   │ $effect runs     │  (because it depends on `value`)         │
│   │ (sync effect)    │                                          │
│   └────────┬─────────┘                                          │
│            │                                                     │
│            ▼                                                     │
│   ┌──────────────────┐                                          │
│   │ Dispatches to    │  view.dispatch({ changes: ... })         │
│   │ CodeMirror       │                                          │
│   └────────┬─────────┘                                          │
│            │                                                     │
│            ▼                                                     │
│   ┌──────────────────┐                                          │
│   │ changeListener   │  ◄─── LOOP BACK TO START                 │
│   │ fires again!     │                                          │
│   └──────────────────┘                                          │
│                                                                  │
│   Result: Infinite loop until Svelte kills it                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Original problematic code:**

```typescript
// Effect 1: Create editor (reads `value`)
$effect(() => {
    if (!container) return;
    view?.destroy();
    const state = EditorState.create({
        doc: value,  // ◄── Reads `value`
        extensions: buildExtensions()
    });
    view = new EditorView({ state, parent: container });
    return () => view?.destroy();
});

// Effect 2: Sync value to editor (reads `value`, writes to view)
$effect(() => {
    if (!view) return;
    const currentDoc = view.state.doc.toString();
    if (value !== currentDoc) {  // ◄── Reads `value`
        view.dispatch({
            changes: { from: 0, to: currentDoc.length, insert: value }
        });
        // This dispatch triggers changeListener which sets `value`
        // Setting `value` triggers this effect again → INFINITE LOOP
    }
});

// Inside buildExtensions():
const changeListener = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
        const newValue = update.state.doc.toString();
        value = newValue;  // ◄── Writes `value` (triggers Effect 2)
        onValueChange?.(newValue);
    }
});
```

### Solution

Added a synchronization flag to break the reactive cycle. When changes originate from the editor itself, the sync effect is skipped:

```typescript
// Flag to track if change came from editor (not reactive)
let isSyncingFromEditor = false;

const changeListener = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
        const newValue = update.state.doc.toString();
        // Set flag BEFORE updating value
        isSyncingFromEditor = true;
        value = newValue;
        onValueChange?.(newValue);
        // Clear flag after microtask (after effects run)
        queueMicrotask(() => {
            isSyncingFromEditor = false;
        });
    }
});

// Sync effect now checks the flag
$effect(() => {
    const currentValue = value;

    // Skip if this change originated from the editor
    if (isSyncingFromEditor) return;
    if (!view) return;

    const currentDoc = view.state.doc.toString();
    if (currentValue !== currentDoc) {
        view.dispatch({
            changes: { from: 0, to: currentDoc.length, insert: currentValue }
        });
    }
});
```

**Key insight:** The flag is a plain JavaScript variable (not `$state`), so changing it doesn't trigger reactivity. The `queueMicrotask` ensures the flag is cleared after Svelte's synchronous effect processing completes.

### Files Modified

- `src/lib/components/Editor.svelte`

---

## Issue 2: PGlite WASM Double-Read Error

### Problem Description

When users clicked "Run & Validate", the application attempted to create two PGlite database instances simultaneously (one for the user's query, one for the expected solution). Both instances tried to fetch and compile the same WebAssembly module concurrently, causing a race condition that crashed the SQL execution.

### Actual Behavior

- Clicking "Run & Validate" produced no result
- Browser console showed error: `Failed to execute 'compile' on 'WebAssembly': Cannot compile WebAssembly.Module from an already read Response`
- The page became unresponsive or showed no feedback

### Expected Behavior

- Query should execute against the in-browser PostgreSQL database
- Results should display showing whether the user's solution matches the expected output
- Status indicator should show "Validation passed" or "Result differs from expected"

### Root Cause Analysis

The `runChallengeQuery` function in `runner.ts` creates two database instances in parallel:

```typescript
// Both calls happen simultaneously
[userDb, expectedDb] = await Promise.all([
    dbPool.acquire(challenge.database),  // Creates PGlite instance #1
    dbPool.acquire(challenge.database)   // Creates PGlite instance #2
]);
```

When the pool is empty (first run or after instances are released), both `acquire` calls trigger `createPGliteInstance()` concurrently:

```
┌─────────────────────────────────────────────────────────────────┐
│                    RACE CONDITION DIAGRAM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Time ──────────────────────────────────────────────────────►  │
│                                                                  │
│   Instance #1:                                                   │
│   ┌─────────┐    ┌─────────────┐    ┌──────────────┐           │
│   │ fetch() │───►│ Response    │───►│ compileStream│           │
│   │ WASM    │    │ body read   │    │ SUCCESS      │           │
│   └─────────┘    └─────────────┘    └──────────────┘           │
│                         │                                        │
│                         │ Body consumed!                         │
│                         ▼                                        │
│   Instance #2:                                                   │
│   ┌─────────┐    ┌─────────────┐    ┌──────────────┐           │
│   │ fetch() │───►│ Same        │───►│ compileStream│           │
│   │ WASM    │    │ Response!   │    │ FAILS!       │           │
│   └─────────┘    └─────────────┘    └──────────────┘           │
│                                             │                    │
│                                             ▼                    │
│                              "Cannot compile WebAssembly.Module  │
│                               from an already read Response"     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Technical explanation:** The `fetch()` API returns a `Response` object whose body is a `ReadableStream`. This stream can only be consumed once. When `WebAssembly.compileStreaming()` reads the response body for the first instance, the stream is exhausted. The second instance receives the same cached `Response` object (due to browser HTTP caching or PGlite's internal caching), but attempting to read its already-consumed body fails.

**Original problematic code:**

```typescript
async function createPGliteInstance(): Promise<PGlite> {
    // No synchronization - multiple calls can run simultaneously
    const db = await PGlite.create();
    return db;
}
```

### Solution

Serialize PGlite instance creation using a promise queue. Each new instance waits for the previous one to complete before starting:

```typescript
// Queue to serialize instance creation
let creationQueue: Promise<PGlite> = Promise.resolve(null as unknown as PGlite);

async function createPGliteInstance(): Promise<PGlite> {
    // Save reference to current queue head
    const previousCreation = creationQueue;

    // Create new promise that waits for previous
    const newCreation = (async () => {
        // Wait for any previous creation to finish
        await previousCreation.catch(() => {});

        // Small delay to ensure WASM is fully initialized
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Now safe to create new instance
        const db = await PGlite.create();
        console.log('PGlite instance created successfully');
        return db;
    })();

    // Update queue head to this creation
    creationQueue = newCreation;
    return newCreation;
}
```

**How it works:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    SERIALIZED CREATION                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Time ──────────────────────────────────────────────────────►  │
│                                                                  │
│   Instance #1:                                                   │
│   ┌─────────┐    ┌─────────────┐    ┌──────────────┐           │
│   │ fetch() │───►│ Response    │───►│ compileStream│           │
│   │ WASM    │    │ body read   │    │ SUCCESS      │           │
│   └─────────┘    └─────────────┘    └──────────────┘           │
│                                             │                    │
│                                             │ Completes          │
│                                             ▼                    │
│   Instance #2:                     (waits for #1)                │
│   ┌─────────┐    ┌─────────────┐    ┌──────────────┐           │
│   │ fetch() │───►│ Fresh       │───►│ compileStream│           │
│   │ WASM    │    │ Response    │    │ SUCCESS      │           │
│   └─────────┘    └─────────────┘    └──────────────┘           │
│                                                                  │
│   Result: Both instances created successfully                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Alternative Solutions Considered

1. **Pre-compile WASM module once and reuse:** Attempted but failed due to Vite bundler not supporting dynamic WASM imports from node_modules in the required format.

2. **Use PGlite Worker:** Would move PGlite to a Web Worker, isolating WASM loading. More complex architecture change, not necessary for this fix.

3. **Clone Response before compiling:** Not feasible as `Response.clone()` still shares the underlying body stream in some scenarios.

### Files Modified

- `src/lib/logic/runner.ts`

---

## Testing Verification

### Automated Tests (Playwright)

```javascript
// Test confirmed all buttons work after fix:
- Difficulty tabs switch correctly ✓
- Challenge cards are selectable ✓
- Run & Validate executes queries ✓
- Reset button restores starter SQL ✓
- Challenge switching works ✓
```

### Manual Testing Checklist

| Feature | Before Fix | After Fix |
|---------|------------|-----------|
| Click difficulty tab | No response | Switches difficulty |
| Click challenge card | No response | Selects challenge |
| Click "Run & Validate" | No response | Executes and shows result |
| Click "Reset" | No response | Resets SQL to starter |
| Click "Ask Claude for hint" | No response | Fetches hint |
| Switch playground database | No response | Changes database |
| Run playground query | No response | Shows query result |

---

## Lessons Learned

### Svelte 5 Reactivity

1. **Avoid read-write cycles in effects:** If an effect reads state and indirectly causes that state to be written, it will loop infinitely.

2. **Use flags for external integrations:** When integrating with non-reactive libraries (like CodeMirror), use plain JavaScript variables as flags to control reactive behavior.

3. **$effect errors break everything:** An infinite loop in one effect crashes Svelte's entire reactivity system, not just that component.

### WebAssembly Loading

1. **WASM Response bodies are single-use:** The `Response` body from `fetch()` can only be read once. Concurrent compilations fail.

2. **Serialize WASM-heavy operations:** When creating multiple instances of WASM-based libraries, serialize their initialization.

3. **Pool instances when possible:** Reusing database instances (via `PGlitePool`) avoids repeated WASM compilation entirely.

---

## References

- [Svelte 5 Runes Documentation](https://svelte.dev/docs/svelte/$effect)
- [WebAssembly.compileStreaming MDN](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/compileStreaming)
- [PGlite Bundler Support](https://pglite.dev/docs/bundler-support)
- [Response.body ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/Response/body)
