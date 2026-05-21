/**
 * Client-side password generator. Mounted by TryPage.astro on the /try
 * route. Pure DOM manipulation — no framework, so no integration risk and
 * the bundle is just the crypto modules + this file.
 *
 * UI state lives in plain variables; we re-render minimal regions of the
 * DOM by toggling classes and writing textContent rather than reconciling
 * a virtual tree.
 */
import { derivePassword } from "~/lib/crypto/derive.js";
import {
  DEFAULT_MEMORABLE_PROFILE,
  DEFAULT_RANDOM_PROFILE,
  type MemorableProfile,
  type Profile,
} from "~/lib/crypto/types.js";

type Strings = Record<string, string>;

interface MountOptions {
  root: HTMLElement;
  strings: Strings;
}

export function mountGenerator(opts: MountOptions): void {
  const { root, strings: s } = opts;

  let profile: Profile = { ...DEFAULT_RANDOM_PROFILE };
  let busy = false;
  let result: string | null = null;
  let revealed = false;
  let copied = false;
  let error: string | null = null;

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
  const submit = $<HTMLButtonElement>("[data-action=generate]");
  const errorBox = $<HTMLDivElement>("[data-region=error]");
  const resultBox = $<HTMLDivElement>("[data-region=result]");
  const resultValue = $<HTMLElement>("[data-region=result-value]");
  const revealBtn = $<HTMLButtonElement>("[data-action=reveal]");
  const copyBtn = $<HTMLButtonElement>("[data-action=copy]");

  /* ── input wiring ─────────────────────────────────────── */

  masterEl.addEventListener("input", () => {
    clearResult();
  });
  siteEl.addEventListener("input", clearResult);
  emailEl.addEventListener("input", clearResult);
  siteEl.value = "example.com";
  emailEl.value = "you@example.com";

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
    clearResult();
  });

  submit.addEventListener("click", (event) => {
    event.preventDefault();
    void generate();
  });

  $<HTMLFormElement>("form").addEventListener("submit", (event) => {
    event.preventDefault();
    void generate();
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

  /* ── async derive ─────────────────────────────────────── */

  async function generate() {
    error = null;
    if (masterEl.value.length < 8) {
      error = s.tryMinMaster;
      paintError();
      return;
    }
    busy = true;
    paintBusy();
    try {
      const pw = await derivePassword({
        inputs: {
          master: masterEl.value,
          domain: siteEl.value.trim(),
          email: emailEl.value.trim(),
        },
        profile,
      });
      result = pw;
      revealed = false;
      copied = false;
    } catch (err) {
      error = err instanceof Error ? err.message : "generation failed";
    } finally {
      busy = false;
      paintError();
      paintResult();
      paintBusy();
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
        clearResult();
      });
    }

    // Class toggles
    for (const toggle of dynamic.querySelectorAll<HTMLInputElement>("input[data-class]")) {
      toggle.addEventListener("change", () => {
        const key = toggle.dataset.class as "lower" | "upper" | "digits" | "symbols";
        if (profile.mode !== "random") return;
        profile = { ...profile, [key]: toggle.checked };
        clearResult();
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
        clearResult();
      });
    }

    // Memorable boolean toggles
    for (const toggle of dynamic.querySelectorAll<HTMLInputElement>("input[data-bool]")) {
      toggle.addEventListener("change", () => {
        const key = toggle.dataset.bool as "capitalise" | "suffix";
        if (profile.mode !== "memorable") return;
        profile = { ...profile, [key]: toggle.checked } as MemorableProfile;
        clearResult();
      });
    }

    // Counter
    const counter = dynamic.querySelector<HTMLInputElement>("input[data-counter]");
    if (counter !== null) {
      counter.addEventListener("input", () => {
        const n = Number.parseInt(counter.value, 10);
        if (Number.isFinite(n) && n >= 1) {
          profile = { ...profile, counter: n };
          clearResult();
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

  function paintResult() {
    if (result === null) {
      resultBox.classList.add("hidden");
      return;
    }
    resultBox.classList.remove("hidden");
    if (revealed) {
      resultValue.textContent = result;
      resultValue.classList.remove("tracking-[0.15em]", "text-(--color-ink-3)");
      resultValue.classList.add("text-(--color-ink-0)");
    } else {
      resultValue.textContent = "•".repeat(Math.min(result.length, 32));
      resultValue.classList.add("tracking-[0.15em]", "text-(--color-ink-3)");
      resultValue.classList.remove("text-(--color-ink-0)");
    }
    revealBtn.textContent = revealed ? s.tryHide : s.tryReveal;
    copyBtn.textContent = copied ? s.tryCopied : s.tryCopy;
  }

  function paintBusy() {
    submit.disabled = busy || masterEl.value.length < 8;
    submit.textContent = busy ? s.tryGenerating : s.tryGenerate;
  }

  function clearResult() {
    if (result !== null || error !== null) {
      result = null;
      error = null;
      revealed = false;
      copied = false;
      paintResult();
      paintError();
    }
    paintBusy();
  }

  // Initial paint.
  paintMode();
  paintDynamic();
  paintResult();
  paintError();
  paintBusy();

  // Re-enable the submit button as the user types.
  masterEl.addEventListener("input", paintBusy);
}

/* ─────────────────────────────────────────────────────────
   Templates
   ───────────────────────────────────────────────────────── */

function template(s: Strings) {
  return `
    <form autocomplete="off" class="surface flex flex-col gap-5">
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

      <button data-action="generate" type="submit"
        class="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-(--color-ink-0) px-5 text-sm font-medium text-(--color-bg-0) transition-[transform,background-color] duration-200 hover:bg-(--color-ink-1) active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 [box-shadow:0_1px_0_oklch(1_0_0_/_0.1)_inset,0_12px_28px_-8px_oklch(0_0_0_/_0.5)]">${s.tryGenerate}</button>

      <div data-region="error" class="hidden text-sm text-red-400" role="alert"></div>

      <div data-region="result" class="hidden flex-col gap-3 rounded-xl border border-(--color-ink-5) bg-(--color-bg-2) p-4 flex">
        <code data-region="result-value" class="block break-all font-mono text-sm leading-relaxed text-(--color-ink-3) tracking-[0.15em]"></code>
        <div class="flex gap-2">
          <button type="button" data-action="reveal"
            class="inline-flex h-8 items-center justify-center rounded-full border border-(--color-ink-5) bg-transparent px-4 text-xs font-medium text-(--color-ink-1) transition-colors hover:bg-(--color-bg-1)">${s.tryReveal}</button>
          <button type="button" data-action="copy"
            class="inline-flex h-8 items-center justify-center rounded-full border border-(--color-ink-5) bg-transparent px-4 text-xs font-medium text-(--color-ink-1) transition-colors hover:bg-(--color-bg-1)">${s.tryCopy}</button>
        </div>
      </div>

      <p class="m-0 text-xs leading-relaxed text-(--color-ink-3)">${s.tryDisclaimer}</p>
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
