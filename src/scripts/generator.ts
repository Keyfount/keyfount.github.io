/**
 * Client-side password generator. Mounted into the home page's "Try it"
 * section. Pure DOM manipulation — no framework, so no integration risk
 * and the bundle is just the crypto modules + this file.
 *
 * Domain normalisation matches the extension: the raw input is passed
 * through `registrableDomain()` (PSL-aware via tldts) before being fed
 * to the KDF, so `accounts.google.com` and `google.com` derive the same
 * password — same behaviour you'd get from the extension on either tab.
 *
 * Derivation runs in real time as the user types or tweaks a setting —
 * the call is debounced so we don't queue a fresh Argon2id pass on
 * every keystroke, and a generation counter discards stale results.
 */
import { derivePassword } from "~/lib/crypto/derive.js";
import {
  DEFAULT_MEMORABLE_PROFILE,
  DEFAULT_RANDOM_PROFILE,
  type MemorableProfile,
  type Profile,
} from "~/lib/crypto/types.js";
import { registrableDomain } from "~/lib/domain.js";

type Strings = Record<string, string>;

interface MountOptions {
  root: HTMLElement;
  strings: Strings;
}

const DEBOUNCE_MS = 280;

export function mountGenerator(opts: MountOptions): void {
  const { root, strings: s } = opts;

  let profile: Profile = { ...DEFAULT_RANDOM_PROFILE };
  let busy = false;
  let result: string | null = null;
  let revealed = false;
  let copied = false;
  let error: string | null = null;
  let debounceTimer: number | null = null;
  let runId = 0;

  root.innerHTML = template(s);

  const $ = <T extends HTMLElement>(sel: string): T =>
    root.querySelector<T>(sel) ??
    (() => {
      throw new Error(`generator: missing element ${sel}`);
    })();

  const masterEl = $<HTMLInputElement>("[data-field=master]");
  const siteEl = $<HTMLInputElement>("[data-field=site]");
  const emailEl = $<HTMLInputElement>("[data-field=email]");
  const modeWrap = $<HTMLDivElement>("[data-field=mode]");
  const dynamic = $<HTMLDivElement>("[data-region=dynamic]");
  const statusEl = $<HTMLDivElement>("[data-region=status]");
  const errorBox = $<HTMLDivElement>("[data-region=error]");
  const resultBox = $<HTMLDivElement>("[data-region=result]");
  const resultValue = $<HTMLElement>("[data-region=result-value]");
  const revealBtn = $<HTMLButtonElement>("[data-action=reveal]");
  const copyBtn = $<HTMLButtonElement>("[data-action=copy]");

  /* ── input wiring ─────────────────────────────────────── */

  siteEl.value = "example.com";
  emailEl.value = "you@example.com";

  masterEl.addEventListener("input", scheduleDerive);
  siteEl.addEventListener("input", scheduleDerive);
  emailEl.addEventListener("input", scheduleDerive);

  modeWrap.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLButtonElement>("button[data-mode]");
    if (button === null || button === undefined) return;
    const mode = button.dataset.mode as "random" | "memorable" | undefined;
    if (mode === undefined || mode === profile.mode) return;
    profile =
      mode === "random"
        ? { ...DEFAULT_RANDOM_PROFILE, counter: profile.counter }
        : { ...DEFAULT_MEMORABLE_PROFILE, counter: profile.counter };
    paintMode();
    paintDynamic();
    scheduleDerive();
  });

  revealBtn.addEventListener("click", () => {
    revealed = !revealed;
    paintResult();
  });

  copyBtn.addEventListener("click", () => {
    if (result === null) return;
    void navigator.clipboard.writeText(result).then(
      () => {
        copied = true;
        paintResult();
        setTimeout(() => {
          copied = false;
          paintResult();
        }, 1500);
      },
      () => undefined,
    );
  });

  /* ── debounced derive ─────────────────────────────────── */

  function scheduleDerive() {
    if (debounceTimer !== null) window.clearTimeout(debounceTimer);
    // Show a spinner / placeholder while typing so the UI stays responsive.
    result = null;
    revealed = false;
    copied = false;
    error = null;
    paintError();
    paintStatus();
    paintResult();
    debounceTimer = window.setTimeout(() => {
      void derive();
    }, DEBOUNCE_MS);
  }

  async function derive() {
    debounceTimer = null;
    if (masterEl.value.length < 8) {
      busy = false;
      paintStatus();
      paintResult();
      return;
    }
    const myRun = ++runId;
    busy = true;
    paintStatus();
    try {
      const domain = registrableDomain(siteEl.value);
      const pw = await derivePassword({
        inputs: {
          master: masterEl.value,
          domain,
          email: emailEl.value.trim(),
        },
        profile,
      });
      // A newer keystroke started another run: discard this one.
      if (myRun !== runId) return;
      result = pw;
      error = null;
    } catch (err) {
      if (myRun !== runId) return;
      error = err instanceof Error ? err.message : "generation failed";
      result = null;
    } finally {
      if (myRun === runId) {
        busy = false;
        paintError();
        paintResult();
        paintStatus();
      }
    }
  }

  /* ── paint helpers ────────────────────────────────────── */

  function paintMode() {
    for (const button of modeWrap.querySelectorAll<HTMLButtonElement>("button[data-mode]")) {
      const isOn = button.dataset.mode === profile.mode;
      button.setAttribute("aria-pressed", String(isOn));
    }
  }

  function paintDynamic() {
    dynamic.innerHTML =
      profile.mode === "random" ? randomBlock(profile, s) : memorableBlock(profile, s);
    wireDynamic();
  }

  function wireDynamic() {
    // Length / words slider
    const range = dynamic.querySelector<HTMLInputElement>("[data-control=range]");
    if (range !== null) {
      range.addEventListener("input", () => {
        const value = Number.parseInt(range.value, 10);
        if (profile.mode === "random") profile = { ...profile, length: value };
        else profile = { ...profile, wordCount: value };
        const display = dynamic.querySelector<HTMLElement>("[data-control=range-value]");
        if (display !== null) display.textContent = String(value);
        scheduleDerive();
      });
    }

    // Class toggles
    for (const toggle of dynamic.querySelectorAll<HTMLInputElement>("input[data-class]")) {
      toggle.addEventListener("change", () => {
        const key = toggle.dataset.class as "lower" | "upper" | "digits" | "symbols";
        if (profile.mode !== "random") return;
        profile = { ...profile, [key]: toggle.checked };
        scheduleDerive();
      });
    }

    // Memorable separator
    for (const button of dynamic.querySelectorAll<HTMLButtonElement>("button[data-separator]")) {
      button.addEventListener("click", () => {
        const sep = button.dataset.separator as "-" | "." | "_";
        if (profile.mode !== "memorable") return;
        profile = { ...profile, separator: sep };
        for (const b of dynamic.querySelectorAll<HTMLButtonElement>("button[data-separator]")) {
          b.setAttribute("aria-pressed", String(b.dataset.separator === sep));
        }
        scheduleDerive();
      });
    }

    // Memorable boolean toggles
    for (const toggle of dynamic.querySelectorAll<HTMLInputElement>("input[data-bool]")) {
      toggle.addEventListener("change", () => {
        const key = toggle.dataset.bool as "capitalise" | "suffix";
        if (profile.mode !== "memorable") return;
        profile = { ...profile, [key]: toggle.checked } as MemorableProfile;
        scheduleDerive();
      });
    }

    // Counter
    const counter = dynamic.querySelector<HTMLInputElement>("input[data-counter]");
    if (counter !== null) {
      counter.addEventListener("input", () => {
        const n = Number.parseInt(counter.value, 10);
        if (Number.isFinite(n) && n >= 1) {
          profile = { ...profile, counter: n };
          scheduleDerive();
        }
      });
    }
  }

  function paintError() {
    if (error === null) {
      errorBox.classList.add("hidden");
      errorBox.textContent = "";
    } else {
      errorBox.classList.remove("hidden");
      errorBox.textContent = error;
    }
  }

  function paintStatus() {
    if (busy) {
      statusEl.innerHTML = `<span class="inline-block h-1.5 w-1.5 rounded-full bg-[oklch(0.62_0.10_150)] shadow-[0_0_8px_oklch(0.62_0.10_150/0.7)] [animation:var(--animate-pulse-dot)]"></span><span>${s.tryGenerating}</span>`;
      statusEl.classList.remove("hidden");
    } else if (result !== null) {
      statusEl.innerHTML = `<span class="inline-block h-1.5 w-1.5 rounded-full bg-(--color-ink-3)"></span><span>argon2id · ${profile.mode}</span>`;
      statusEl.classList.remove("hidden");
    } else if (masterEl.value.length < 8) {
      statusEl.innerHTML = `<span class="inline-block h-1.5 w-1.5 rounded-full bg-(--color-ink-5)"></span><span>${s.tryIdle}</span>`;
      statusEl.classList.remove("hidden");
    } else {
      statusEl.classList.add("hidden");
    }
  }

  function paintResult() {
    revealBtn.disabled = result === null;
    copyBtn.disabled = result === null;
    if (result === null) {
      resultValue.textContent = "—";
      resultValue.classList.add("text-(--color-ink-4)");
      resultValue.classList.remove("text-(--color-ink-0)", "text-(--color-ink-3)", "tracking-[0.15em]");
      revealBtn.textContent = s.tryReveal;
      copyBtn.textContent = s.tryCopy;
      return;
    }
    if (revealed) {
      resultValue.textContent = result;
      resultValue.classList.remove("tracking-[0.15em]", "text-(--color-ink-3)", "text-(--color-ink-4)");
      resultValue.classList.add("text-(--color-ink-0)");
    } else {
      resultValue.textContent = "•".repeat(Math.min(result.length, 32));
      resultValue.classList.add("tracking-[0.15em]", "text-(--color-ink-3)");
      resultValue.classList.remove("text-(--color-ink-0)", "text-(--color-ink-4)");
    }
    revealBtn.textContent = revealed ? s.tryHide : s.tryReveal;
    copyBtn.textContent = copied ? s.tryCopied : s.tryCopy;
  }

  // Initial paint.
  paintMode();
  paintDynamic();
  paintResult();
  paintError();
  paintStatus();
}

/* ─────────────────────────────────────────────────────────
   Templates
   ───────────────────────────────────────────────────────── */

function template(s: Strings) {
  return `
    <form autocomplete="off" class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8 lg:items-start">
      <div class="surface flex flex-col gap-5">
        <div class="mono-tag">${s.trySettings}</div>

        <label class="flex flex-col gap-2">
          <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-(--color-ink-3)">${s.tryMaster}</span>
          <input data-field="master" type="password" autocomplete="new-password"
            class="h-10 rounded-lg border border-(--color-ink-5) bg-(--color-bg-2) px-3 font-sans text-sm text-(--color-ink-1) outline-none transition-colors duration-150 focus:border-(--color-ink-4)" />
        </label>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label class="flex flex-col gap-2">
            <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-(--color-ink-3)">${s.trySite}</span>
            <input data-field="site" type="text" placeholder="${s.trySitePlaceholder}"
              class="h-10 rounded-lg border border-(--color-ink-5) bg-(--color-bg-2) px-3 font-mono text-sm text-(--color-ink-1) outline-none transition-colors duration-150 focus:border-(--color-ink-4)" />
          </label>
          <label class="flex flex-col gap-2">
            <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-(--color-ink-3)">${s.tryEmail}</span>
            <input data-field="email" type="email" placeholder="${s.tryEmailPlaceholder}"
              class="h-10 rounded-lg border border-(--color-ink-5) bg-(--color-bg-2) px-3 font-mono text-sm text-(--color-ink-1) outline-none transition-colors duration-150 focus:border-(--color-ink-4)" />
          </label>
        </div>

        <div class="flex flex-col gap-3">
          <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-(--color-ink-3)">${s.tryMode}</span>
          <div data-field="mode" class="grid grid-cols-2 gap-[2px] rounded-lg bg-(--color-bg-2) p-[3px]">
            <button type="button" data-mode="random"
              class="h-8 rounded-md text-xs font-medium text-(--color-ink-3) transition-colors aria-pressed:bg-(--color-bg-1) aria-pressed:text-(--color-ink-0) aria-pressed:shadow-[0_1px_2px_rgba(0,0,0,0.25)]">${s.tryModeRandom}</button>
            <button type="button" data-mode="memorable"
              class="h-8 rounded-md text-xs font-medium text-(--color-ink-3) transition-colors aria-pressed:bg-(--color-bg-1) aria-pressed:text-(--color-ink-0) aria-pressed:shadow-[0_1px_2px_rgba(0,0,0,0.25)]">${s.tryModeMemorable}</button>
          </div>
        </div>

        <div data-region="dynamic" class="flex flex-col gap-5"></div>
      </div>

      <div class="surface flex flex-col gap-5 lg:sticky lg:top-6">
        <div class="flex items-center justify-between gap-3">
          <span class="mono-tag">${s.tryResult}</span>
          <div data-region="status" class="status-pill"></div>
        </div>

        <div class="flex min-h-[88px] items-center rounded-xl border border-(--color-ink-5) bg-(--color-bg-2) px-4 py-4">
          <code data-region="result-value" class="block w-full break-all font-mono text-base leading-relaxed text-(--color-ink-4)">—</code>
        </div>

        <div class="flex flex-wrap gap-2">
          <button type="button" data-action="reveal"
            class="inline-flex h-9 items-center justify-center rounded-full border border-(--color-ink-5) bg-transparent px-4 text-xs font-medium text-(--color-ink-1) transition-colors hover:bg-(--color-bg-1) disabled:cursor-not-allowed disabled:opacity-40">${s.tryReveal}</button>
          <button type="button" data-action="copy"
            class="inline-flex h-9 items-center justify-center rounded-full border border-(--color-ink-5) bg-transparent px-4 text-xs font-medium text-(--color-ink-1) transition-colors hover:bg-(--color-bg-1) disabled:cursor-not-allowed disabled:opacity-40">${s.tryCopy}</button>
        </div>

        <div data-region="error" class="hidden text-sm text-red-400" role="alert"></div>
        <p class="m-0 text-xs leading-relaxed text-(--color-ink-3)">${s.tryDisclaimer}</p>
      </div>
    </form>
  `;
}

function randomBlock(profile: { length: number }, s: Strings) {
  return `
    <div class="flex flex-col gap-2">
      <div class="flex items-baseline justify-between">
        <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-(--color-ink-3)">${s.tryLength}</span>
        <span data-control="range-value" class="font-mono text-sm text-(--color-ink-1)">${profile.length}</span>
      </div>
      <input data-control="range" type="range" min="5" max="35" value="${profile.length}" class="h-5 w-full appearance-none bg-transparent" />
    </div>

    <div class="flex flex-col gap-2">
      <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-(--color-ink-3)">${s.tryClasses}</span>
      <div class="grid grid-cols-2 gap-2">
        ${classToggle("lower", s.tryClassLower, true)}
        ${classToggle("upper", s.tryClassUpper, true)}
        ${classToggle("digits", s.tryClassDigits, true)}
        ${classToggle("symbols", s.tryClassSymbols, true)}
      </div>
    </div>

    ${counterBlock(s)}
  `;
}

function memorableBlock(profile: MemorableProfile, s: Strings) {
  return `
    <div class="flex flex-col gap-2">
      <div class="flex items-baseline justify-between">
        <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-(--color-ink-3)">${s.tryWords}</span>
        <span data-control="range-value" class="font-mono text-sm text-(--color-ink-1)">${profile.wordCount}</span>
      </div>
      <input data-control="range" type="range" min="5" max="8" value="${profile.wordCount}" class="h-5 w-full appearance-none bg-transparent" />
    </div>

    <div class="flex flex-col gap-2">
      <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-(--color-ink-3)">${s.trySeparator}</span>
      <div class="grid grid-cols-3 gap-[2px] rounded-lg bg-(--color-bg-2) p-[3px]">
        ${separatorButton("-", profile.separator === "-")}
        ${separatorButton(".", profile.separator === ".")}
        ${separatorButton("_", profile.separator === "_")}
      </div>
    </div>

    ${boolToggle("capitalise", s.tryCapitalise, profile.capitalise)}
    ${boolToggle("suffix", s.trySuffix, profile.suffix)}

    ${counterBlock(s)}
  `;
}

function classToggle(key: string, label: string, checked: boolean) {
  return `
    <label class="flex items-center justify-between gap-2 text-sm text-(--color-ink-1) cursor-pointer">
      <span>${label}</span>
      <span class="relative inline-block h-5 w-9 shrink-0">
        <input data-class="${key}" type="checkbox" ${checked ? "checked" : ""}
          class="absolute inset-0 m-0 cursor-pointer appearance-none peer" />
        <span class="pointer-events-none absolute inset-0 rounded-full bg-(--color-ink-5) transition-colors peer-checked:bg-(--color-ink-1)"></span>
        <span class="pointer-events-none absolute top-[2px] left-[2px] h-4 w-4 rounded-full bg-(--color-bg-0) transition-transform duration-200 peer-checked:translate-x-4" style="transition-timing-function: var(--ease-spring);"></span>
      </span>
    </label>
  `;
}

function separatorButton(sep: string, pressed: boolean) {
  return `
    <button type="button" data-separator="${sep}" aria-pressed="${pressed}"
      class="h-7 rounded-md font-mono text-sm text-(--color-ink-3) transition-colors aria-pressed:bg-(--color-bg-1) aria-pressed:text-(--color-ink-0)">${sep}</button>
  `;
}

function boolToggle(key: string, label: string, checked: boolean) {
  return `
    <label class="flex items-center justify-between gap-2 text-sm text-(--color-ink-1) cursor-pointer">
      <span>${label}</span>
      <span class="relative inline-block h-5 w-9 shrink-0">
        <input data-bool="${key}" type="checkbox" ${checked ? "checked" : ""}
          class="absolute inset-0 m-0 cursor-pointer appearance-none peer" />
        <span class="pointer-events-none absolute inset-0 rounded-full bg-(--color-ink-5) transition-colors peer-checked:bg-(--color-ink-1)"></span>
        <span class="pointer-events-none absolute top-[2px] left-[2px] h-4 w-4 rounded-full bg-(--color-bg-0) transition-transform duration-200 peer-checked:translate-x-4" style="transition-timing-function: var(--ease-spring);"></span>
      </span>
    </label>
  `;
}

function counterBlock(s: Strings) {
  return `
    <label class="flex items-center justify-between gap-3">
      <span class="font-mono text-[11px] uppercase tracking-[0.18em] text-(--color-ink-3)">${s.tryCounter}</span>
      <input data-counter type="number" min="1" value="1"
        class="h-8 w-20 rounded-lg border border-(--color-ink-5) bg-(--color-bg-2) px-2 text-right font-mono text-sm text-(--color-ink-1) outline-none focus:border-(--color-ink-4)" />
    </label>
  `;
}
