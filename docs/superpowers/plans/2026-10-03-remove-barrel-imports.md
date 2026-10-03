# Remove Barrel Imports Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all barrel index.ts files (pure re-exports) and update all imports to use direct file paths with existing tsconfig path aliases.

**Architecture:** This is a large-scale import refactor. We'll proceed systematically by module hierarchy - start with leaf modules, update their consumers, then remove their barrel files. Use direct imports to actual source files while leveraging @ aliases from tsconfig.

**Tech Stack:** TypeScript, React Native/Expo, Metro bundler

## Global Constraints

- All changes must preserve existing functionality
- Follow existing code style and conventions
- Use @ path aliases from tsconfig.json where they exist
- Do not create new barrel files
- Be careful about src/shared/utils/index.ts - it has specific purity requirements (documented in codebase)
- Inside src/shared/components/, when importing between submodules, be aware of the note in AGENTS.md about avoiding cycles
- All existing tests must still pass
- Run typecheck and lint after each major phase

---


## Task 1: Analyze and Inventory All Barrel Files

**Files:**
- Read: All index.ts files found via glob
- Create: Inventory document for tracking

**Interfaces:**
- Consumes: None (first task)
- Produces: Complete inventory of all barrel files and their exports

- [ ] **Step 1: Create inventory of all barrel files**
  Create a comprehensive list of all index.ts files and categorize them:
  - Shared barrels (api, components subdirs, hooks, lib, stores, types, utils, validation)
  - Feature barrels (login, registration, etc.)
  - Determine which are pure re-exports vs have logic (like api/index.ts does have logic)

- [ ] **Step 2: For each pure barrel, extract what it exports**
  For each barrel file that only does `export * from ...`, list all symbols it exports and where they come from.

- [ ] **Step 3: Commit inventory**
```bash
git add docs/superpowers/plans/2026-10-03-remove-barrel-imports.md
git commit -m "docs: add barrel removal plan with inventory"
```

## Task 2: Handle Special Cases - Identify Non-Pure Barrels

**Files:**
- Read: src/shared/api/index.ts (has logic), src/shared/utils/index.ts (has purity constraint), src/shared/utils/helpers/index.ts

**Interfaces:**
- Consumes: Task 1 inventory
- Produces: Decision for each non-pure barrel

- [ ] **Step 1: Analyze src/shared/api/index.ts**
  This barrel contains actual implementation (createApi function). Decide: keep it as-is or split? It exports both types and implementation. Maybe keep the factory function but also note - the user wants barrels removed. But it's not just re-exporting, it's providing API. Need to be careful not to break the public API surface if others import from it. But per user request "remove all barrel import and expo and all file should be imported directly from the file" - they want to eliminate barrel pattern. For files with logic, maybe refactor? Or just update how it's consumed? Need to look up how it's used.

- [ ] **Step 2: Analyze src/shared/utils/index.ts**
  Has purity constraint documented. Contains side-effect-free exports only. But still a barrel.

- [ ] **Step 3: Document special handling approach**
  Record decisions for each non-pure barrel in the plan.

- [ ] **Step 4: Commit**
```bash
git add docs/superpowers/plans/2026-10-03-remove-barrel-imports.md
git commit -m "docs: document special barrel cases"
```

## Task 3: Update Component Imports - Phase 1 (Leaf UI Components)

**Files:**
- Modify: Files importing from @components/ui submodules and from @components barrel
- Focus on: src/shared/components/ui/* files and their direct consumers

**Interfaces:**
- Consumes: Task 1 inventory
- Produces: UI component imports updated to direct paths

**Scope:**
Start with UI components (lowest level) as they're consumed by layout/common/screens.

- [ ] **Step 1: Update internal UI component imports**
  For files inside src/shared/components/ui/, replace relative imports between ui components if they use barrels. Also update to use @components/ui/* if coming from outside? Or use relative for same module.

- [ ] **Step 2: Update consumers of UI components to direct imports**
  Files importing specific UI components from barrels - change to direct paths like @components/ui/button, @components/ui/icon etc.

- [ ] **Step 3: Typecheck**
```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "refactor: update UI component imports to direct paths"
```

## Task 4: Update Component Imports - Phase 2 (Layout, Common, Screens)

**Files:**
- Modify: src/shared/components/layout/*, common/*, screens/* and their consumers
- Also handle the providers

**Interfaces:**
- Consumes: Task 3 changes
- Produces: Layout/common/screens imports updated

- [ ] **Step 1: Update layout component imports to direct paths**
  Replace imports from layout barrels with direct @components/layout/* paths

- [ ] **Step 2: Update common component imports**
  Update imports for common components to direct paths

- [ ] **Step 3: Update screens component imports**
  Update imports for screen components to direct paths

- [ ] **Step 4: Update providers imports**
  Handle providers - src/shared/components/providers has subdirs with barrels too

- [ ] **Step 5: Typecheck**
```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**
```bash
git add .
git commit -m "refactor: update layout/common/screens/providers imports to direct paths"
```

## Task 5: Update Feature Files Using @components Barrel

**Files:**
- Modify: All feature files and app files importing from @components (we saw 31 matches)

**Interfaces:**
- Consumes: Tasks 3-4 (component module structure)
- Produces: Feature files import directly from specific component files

**Note from AGENTS.md:** "Inside src/shared/components/, import the specific sub-barrel (../ui, ../common, ../screens), never the top-level @components barrel. The barrel re-exports every component, so a file inside the tree importing it creates a cycle."

But for files outside src/shared/components/ (features, app), they currently import from @components which is the barrel. We need to change them to import directly from the specific source files, e.g. @components/ui/button, @components/screens/not-found etc.

- [ ] **Step 1: Update app routes**
  Update src/app files that import from @components

- [ ] **Step 2: Update feature files**
  Update all feature components/screens/hooks that import from @components

- [ ] **Step 3: Typecheck**
```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**
```bash
git add .
git commit -m "refactor: update features and app to import components directly"
```

## Task 6: Update Utils Imports

**Files:**
- Modify: Files importing from @utils barrel and from sub-barrels

**Interfaces:**
- Consumes: Utils barrel structure
- Produces: Direct imports from specific util files

We saw 33 matches importing from @utils. Also need to handle @utils/helpers etc. Note src/shared/utils/index.ts has purity constraint - but we're removing barrels; consumers will import directly from specific files like @utils/helpers/cn, @utils/logger etc.

- [ ] **Step 1: Update all imports from @utils to specific paths**
  For example: cn comes from @utils/helpers/cn, logger from @utils/logger, formatDate2 from @utils/helpers/formatters etc. Need to look up actual file locations.

- [ ] **Step 2: Update imports from @utils/helpers sub-barrels**
  Handle any imports from @utils/helpers (barrel) - update to direct

- [ ] **Step 3: Update any relative imports within utils**
  Clean up internal imports

- [ ] **Step 4: Typecheck**
```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**
```bash
git add .
git commit -m "refactor: update utils imports to direct paths"
```

## Task 7: Update Hooks, Stores, API, Lib, Types, Config Imports

**Files:**
- Modify: Files using @hooks, @stores, @api, @lib, @sharedTypes/@sharedTypes/*, @config, @validation barrels

**Interfaces:**
- Consumes: Barrel structure of each module
- Produces: Direct imports

- [ ] **Step 1: Update @hooks barrel imports**
  Found imports like in use-snackbar.ts importing IconName from @components? Wait - looking back at grep results, some imports from @components. Also need to handle @hooks itself. Let us look up actual @hooks usage.

- [ ] **Step 2: Update @stores imports**
  Files importing from store barrels

- [ ] **Step 3: Update @sharedTypes imports**
  Update to direct type file imports

- [ ] **Step 4: Update @api, @lib, @config, @validation imports**
  Handle each module's consumers

- [ ] **Step 5: Typecheck**
```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**
```bash
git add .
git commit -m "refactor: update hooks/stores/types/api/lib/config/validation imports to direct paths"
```

## Task 8: Remove Barrel Files - Phase 1 (Leaf Barrels)

**Files:**
- Delete: Pure barrel index.ts files in subdirectories (ui, layout, common, screens sub-barrels, etc.)

**Interfaces:**
- Consumes: All import updates from previous tasks
- Produces: Barrel files deleted

Start removing barrels from leaves upward - remove subdirectory barrels first, then parent barrels.

- [ ] **Step 1: Remove component sub-barrel files**
  Delete: src/shared/components/ui/index.ts, layout/index.ts, common/index.ts, screens/index.ts, providers/*/index.ts, providers/index.ts (if pure)

- [ ] **Step 2: Remove utils sub-barrels**
  Delete: src/shared/utils/helpers/*/index.ts (like date/index.ts, formatters/index.ts etc), src/shared/utils/helpers/index.ts, src/shared/utils/logger/index.ts barrel? Let us look - logger/index.ts probably just re-exports or contains logger. Also http/index.ts has logic (exports client). Need to be selective.

- [ ] **Step 3: Remove hooks sub-barrels (feature level)**
  Delete feature-level barrel files like src/features/login/hooks/index.ts, components/index.ts etc if they're pure re-exports

- [ ] **Step 4: Typecheck**
```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**
```bash
git add -A
git commit -m "refactor: remove leaf barrel files"
```


## Inventory (Task 1)

- ./expo-config/index.ts — pure=True, 5 re-exports
- ./src/features/change-password/components/index.ts — pure=True, 2 re-exports
- ./src/features/change-password/hooks/index.ts — pure=True, 1 re-exports
- ./src/features/change-password/index.ts — pure=True, 1 re-exports
- ./src/features/change-password/screens/index.ts — pure=True, 1 re-exports
- ./src/features/change-password/utils/constants/index.ts — pure=True, 0 re-exports
- ./src/features/change-password/validators/index.ts — pure=True, 1 re-exports
- ./src/features/dlc-status/index.ts — pure=True, 0 re-exports
- ./src/features/home/index.ts — pure=True, 0 re-exports
- ./src/features/home/screens/index.ts — pure=True, 1 re-exports
- ./src/features/login/components/index.ts — pure=True, 1 re-exports
- ./src/features/login/hooks/index.ts — pure=True, 1 re-exports
- ./src/features/login/index.ts — pure=True, 4 re-exports
- ./src/features/login/screens/index.ts — pure=True, 0 re-exports
- ./src/features/login/validators/index.ts — pure=True, 1 re-exports
- ./src/features/pension-statements/components/index.ts — pure=True, 2 re-exports
- ./src/features/pension-statements/hooks/index.ts — pure=True, 1 re-exports
- ./src/features/pension-statements/index.ts — pure=True, 2 re-exports
- ./src/features/pension-statements/screens/index.ts — pure=True, 1 re-exports
- ./src/features/pension-statements/types/index.ts — pure=True, 1 re-exports
- ./src/features/preview-base64/index.ts — pure=True, 0 re-exports
- ./src/features/privacy-policy/components/index.ts — pure=True, 4 re-exports
- ./src/features/privacy-policy/index.ts — pure=True, 2 re-exports
- ./src/features/privacy-policy/screens/index.ts — pure=True, 1 re-exports
- ./src/features/privacy-policy/types/index.ts — pure=False, 0 re-exports
- ./src/features/profile/components/index.ts — pure=True, 2 re-exports
- ./src/features/profile/index.ts — pure=True, 3 re-exports
- ./src/features/profile/screens/index.ts — pure=True, 2 re-exports
- ./src/features/profile/utils/constants/index.ts — pure=True, 1 re-exports
- ./src/features/profile/validators/index.ts — pure=True, 1 re-exports
- ./src/features/registration/components/index.ts — pure=True, 6 re-exports
- ./src/features/registration/hooks/index.ts — pure=True, 2 re-exports
- ./src/features/registration/index.ts — pure=True, 5 re-exports
- ./src/features/registration/screens/index.ts — pure=True, 0 re-exports
- ./src/features/registration/store/index.ts — pure=True, 1 re-exports
- ./src/features/registration/validators/index.ts — pure=True, 1 re-exports
- ./src/features/user-manual/components/index.ts — pure=True, 3 re-exports
- ./src/features/user-manual/components/sections/index.ts — pure=True, 0 re-exports
- ./src/features/user-manual/index.ts — pure=True, 2 re-exports
- ./src/features/user-manual/screens/index.ts — pure=True, 4 re-exports
- ./src/features/user-manual/types/index.ts — pure=False, 0 re-exports
- ./src/features/verification/components/index.ts — pure=True, 6 re-exports
- ./src/features/verification/hooks/index.ts — pure=True, 1 re-exports
- ./src/features/verification/index.ts — pure=True, 4 re-exports
- ./src/features/verification/screens/index.ts — pure=True, 1 re-exports
- ./src/features/verification/types/index.ts — pure=True, 2 re-exports
- ./src/features/withdrawal/index.ts — pure=True, 0 re-exports
- ./src/shared/api/client/index.ts — pure=True, 1 re-exports
- ./src/shared/api/http/index.ts — pure=False, 0 re-exports
- ./src/shared/api/index.ts — pure=False, 0 re-exports
- ./src/shared/api/services/index.ts — pure=True, 1 re-exports
- ./src/shared/components/common/index.ts — pure=True, 8 re-exports
- ./src/shared/components/index.ts — pure=True, 5 re-exports
- ./src/shared/components/layout/index.ts — pure=True, 6 re-exports
- ./src/shared/components/providers/camera/index.ts — pure=True, 1 re-exports
- ./src/shared/components/providers/errors/index.ts — pure=True, 1 re-exports
- ./src/shared/components/providers/index.ts — pure=True, 7 re-exports
- ./src/shared/components/providers/location/index.ts — pure=True, 1 re-exports
- ./src/shared/components/providers/query/index.ts — pure=True, 1 re-exports
- ./src/shared/components/providers/root/index.ts — pure=True, 1 re-exports
- ./src/shared/components/screens/index.ts — pure=True, 8 re-exports
- ./src/shared/components/ui/index.ts — pure=True, 10 re-exports
- ./src/shared/config/index.ts — pure=True, 1 re-exports
- ./src/shared/hooks/index.ts — pure=True, 11 re-exports
- ./src/shared/lib/encryption/index.ts — pure=True, 3 re-exports
- ./src/shared/lib/index.ts — pure=True, 1 re-exports
- ./src/shared/stores/index.ts — pure=True, 5 re-exports
- ./src/shared/types/api/index.ts — pure=True, 4 re-exports
- ./src/shared/types/auth/index.ts — pure=True, 2 re-exports
- ./src/shared/types/code-directory/index.ts — pure=False, 0 re-exports
- ./src/shared/types/index.ts — pure=True, 3 re-exports
- ./src/shared/types/page/index.ts — pure=True, 1 re-exports
- ./src/shared/utils/constants/index.ts — pure=True, 6 re-exports
- ./src/shared/utils/helpers/date/index.ts — pure=True, 1 re-exports
- ./src/shared/utils/helpers/formatters/index.ts — pure=True, 1 re-exports
- ./src/shared/utils/helpers/index.ts — pure=True, 8 re-exports
- ./src/shared/utils/helpers/linking/index.ts — pure=True, 1 re-exports
- ./src/shared/utils/helpers/page/index.ts — pure=True, 1 re-exports
- ./src/shared/utils/helpers/regex-patterns/index.ts — pure=False, 0 re-exports
- ./src/shared/utils/http/index.ts — pure=True, 1 re-exports
- ./src/shared/utils/index.ts — pure=True, 7 re-exports
- ./src/shared/utils/logger/index.ts — pure=False, 0 re-exports
- ./src/shared/utils/react-query/index.ts — pure=False, 1 re-exports
- ./src/shared/validation/common/index.ts — pure=False, 0 re-exports

## Special Cases Decision (Task 2)

### src/shared/api/index.ts
- Contains implementation (createApi function) + exports types/config. Not a pure re-export barrel.
- Decision: Extract implementation to src/shared/api/factory.ts, keep the factory and types accessible. Or better, update consumers to import directly from the actual source files. The createApi is defined in the index.ts itself currently - but also imports from ./client, ./services, ./http. Consumers import from '@api' barrel. 
- Action: Since user wants to remove barrels, we should split - move createApi implementation to a proper module (or keep as-is but the index.ts has logic). But easier: For non-pure barrels that are meant to be the public API surface, we need to understand if others import from them as barrels. Also api/index.ts is both a barrel (re-exporting nothing except maybe not) and factory. Better to extract createApi to factory.ts, and potentially make index.ts re-export what makes sense? Or just delete index.ts if nothing pure to export? Let us look up what's exported.
- The index.ts exports createApi function and ApiConfig interface. It does NOT export * from other files - it defines its own exports. So it's not a barrel - it's a module with implementation. We should NOT delete it. Similar for other non-pure modules.

### src/shared/utils/index.ts
- Pure barrel (only re-exports side-effect-free helpers and logger). Has purity constraint noted. This is a pure barrel - REMOVE it. Consumers must import directly.

### expo-config/index.ts
- Has implementation (exports default config, reads from env, etc.). Not a pure barrel. PRESERVE - contains actual module logic, not just re-exports.

### Other non-pure index.ts files
- src/shared/types/code-directory/index.ts - has no re-exports, just maybe type declarations? Let us check. Also other files with 0 re-exports - likely contain actual code/types, not pure barrels. Preserve them.

Decision: Only delete index.ts files where is_pure=True (they only do `export * from ...` with no other code). Do NOT delete any index.ts that contains implementation, type/interface declarations not just re-exports, or actual module logic.
