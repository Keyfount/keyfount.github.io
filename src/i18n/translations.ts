/**
 * Tiny i18n catalogue.
 *
 * Each entry is { en, fr }. The `t()` helper in `./index.ts` reads the
 * active locale from the request URL and returns the right one.
 *
 * Keep keys grouped by surface (nav, hero, ...) and stable — the string
 * IDs ship to the client in some components (the Generator), so renaming
 * is a breaking change.
 */
export type Locale = "en" | "fr";

export const LOCALES = ["en", "fr"] as const;
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

interface Entry {
  en: string;
  fr: string;
}

export const STRINGS = {
  meta_title: {
    en: "ItsMyPassword — Nothing to keep.",
    fr: "ItsMyPassword — Rien à garder.",
  },
  meta_description: {
    en: "A deterministic password manager Chrome extension. No vault, no sync, no cloud — just an algorithm.",
    fr: "Un gestionnaire de mots de passe déterministe pour Chrome. Pas de coffre, pas de sync, pas de cloud — juste un algorithme.",
  },

  /* corners */
  corner_brand: { en: "itsmypassword", fr: "itsmypassword" },
  corner_build: { en: "v0.1 · ephemeral build", fr: "v0.1 · build éphémère" },
  corner_entropy: { en: "entropy · 256 bits", fr: "entropie · 256 bits" },
  corner_counter_template: {
    en: "$N$ generated · 000000 kept",
    fr: "$N$ générés · 000000 gardés",
  },

  /* hero */
  hero_headline: { en: "Nothing to keep.", fr: "Rien à garder." },
  hero_status: {
    en: "regenerating · never stored",
    fr: "régénération · jamais stockés",
  },
  hero_press_space: {
    en: "press space to summon one",
    fr: "appuyez sur espace pour en invoquer un",
  },
  hero_cta_source: { en: "Get the source", fr: "Voir le code source" },
  hero_cta_how: { en: "How it works", fr: "Comment ça marche" },
  hero_cta_try: { en: "Try it here", fr: "Essayer ici" },

  /* how it works */
  how_tag: { en: "how it works", fr: "fonctionnement" },
  how_title: { en: "A function, not a vault.", fr: "Une fonction, pas un coffre." },
  how_body: {
    en: "ItsMyPassword doesn't keep your passwords anywhere. It recomputes them on demand from three inputs you control — same inputs in, same password out, on any device, with nothing to sync.",
    fr: "ItsMyPassword ne stocke vos mots de passe nulle part. Il les recalcule à la demande à partir de trois entrées que vous contrôlez — mêmes entrées, même mot de passe, sur n'importe quel appareil, sans rien à synchroniser.",
  },
  how_step1_title: {
    en: "You remember the master.",
    fr: "Vous retenez le maître.",
  },
  how_step1_body: {
    en: "Pick a master password you can hold in your head. It never leaves this device.",
    fr: "Choisissez un mot de passe maître que vous pouvez retenir. Il ne quitte jamais cet appareil.",
  },
  how_step2_title: {
    en: "We salt with site and email.",
    fr: "On le salt avec le site et l'email.",
  },
  how_step2_body: {
    en: "Each derivation mixes your master with the site's registrable domain and the email you use there.",
    fr: "Chaque dérivation mélange votre maître avec le domaine racine du site et l'email que vous y utilisez.",
  },
  how_step3_title: {
    en: "Argon2id produces a password.",
    fr: "Argon2id produit un mot de passe.",
  },
  how_step3_body: {
    en: "A memory-hard key-derivation function turns the inputs into a unique, reproducible password — and forgets.",
    fr: "Une fonction de dérivation mémoire-intensive transforme les entrées en un mot de passe unique et reproductible — puis oublie.",
  },

  /* promise */
  promise_tag: { en: "the promise", fr: "la promesse" },
  promise_title: { en: "Less to trust.", fr: "Moins à faire confiance." },
  promise_body: {
    en: "Most password managers ask you to trust a vault, a sync service, and the encryption around both. ItsMyPassword asks you to trust a single algorithm — short enough to read in an evening.",
    fr: "La plupart des gestionnaires demandent de faire confiance à un coffre, à un service de sync, et au chiffrement autour des deux. ItsMyPassword vous demande de faire confiance à un seul algorithme — assez court pour le lire en une soirée.",
  },
  promise_no_vault: { en: "No vault", fr: "Pas de coffre" },
  promise_no_vault_body: {
    en: "Nothing to encrypt, decrypt, sync or leak.",
    fr: "Rien à chiffrer, déchiffrer, synchroniser ou fuiter.",
  },
  promise_no_cloud: { en: "No cloud", fr: "Pas de cloud" },
  promise_no_cloud_body: {
    en: "The extension makes zero network calls. Read the bundle and verify.",
    fr: "L'extension ne fait aucun appel réseau. Lisez le bundle et vérifiez.",
  },
  promise_no_telemetry: { en: "No telemetry", fr: "Pas de télémétrie" },
  promise_no_telemetry_body: {
    en: "No analytics, no error reporting, no third-party SDKs.",
    fr: "Pas d'analytics, pas de rapport d'erreurs, pas de SDK tiers.",
  },
  promise_oss: { en: "Open source", fr: "Open source" },
  promise_oss_body: {
    en: "Algorithm, UI and tests are MIT-licensed on GitHub.",
    fr: "Algorithme, UI et tests sont sous licence MIT sur GitHub.",
  },

  /* install */
  install_tag: { en: "install", fr: "installer" },
  install_title: { en: "Bring it to your browser.", fr: "Apportez-le à votre navigateur." },
  install_body: {
    en: "The extension is in pre-release. The source builds today; the Chrome Web Store listing is next. Star the repo to hear about it.",
    fr: "L'extension est en pré-version. Le code se construit dès aujourd'hui ; la mise en ligne sur le Chrome Web Store est la prochaine étape. Mettez une étoile au repo pour suivre.",
  },
  install_get_source: { en: "Get the source", fr: "Voir le code source" },
  install_read_design: { en: "Read the design", fr: "Lire le design" },

  /* footer */
  footer_extension: { en: "Extension", fr: "Extension" },
  footer_website: { en: "Website", fr: "Site web" },
  footer_org: { en: "Organisation", fr: "Organisation" },

  /* try / generator page */
  try_title: { en: "Try it here.", fr: "Essayez-le ici." },
  try_meta_title: {
    en: "Try ItsMyPassword — Nothing to keep.",
    fr: "Essayer ItsMyPassword — Rien à garder.",
  },
  try_body: {
    en: "Type a master password, a site and an email. The same algorithm the extension uses derives a password right in your browser — nothing is sent, nothing is stored.",
    fr: "Entrez un mot de passe maître, un site et un email. Le même algorithme que celui de l'extension dérive un mot de passe directement dans votre navigateur — rien n'est envoyé, rien n'est stocké.",
  },
  try_master: { en: "Master password", fr: "Mot de passe maître" },
  try_site: { en: "Site domain", fr: "Domaine du site" },
  try_site_placeholder: { en: "example.com", fr: "exemple.com" },
  try_email: { en: "Email", fr: "Email" },
  try_email_placeholder: { en: "you@example.com", fr: "vous@exemple.com" },
  try_mode: { en: "Mode", fr: "Mode" },
  try_mode_random: { en: "Random characters", fr: "Caractères aléatoires" },
  try_mode_memorable: { en: "Memorable", fr: "Mémorisable" },
  try_length: { en: "Length", fr: "Longueur" },
  try_words: { en: "Words", fr: "Mots" },
  try_separator: { en: "Separator", fr: "Séparateur" },
  try_counter: { en: "Counter", fr: "Compteur" },
  try_classes: { en: "Character classes", fr: "Classes de caractères" },
  try_class_lower: { en: "Lowercase", fr: "Minuscules" },
  try_class_upper: { en: "Uppercase", fr: "Majuscules" },
  try_class_digits: { en: "Digits", fr: "Chiffres" },
  try_class_symbols: { en: "Symbols", fr: "Symboles" },
  try_capitalise: { en: "Capitalise one word", fr: "Capitaliser un mot" },
  try_suffix: { en: "Add digit + symbol", fr: "Ajouter chiffre + symbole" },
  try_generate: { en: "Generate", fr: "Générer" },
  try_generating: { en: "Generating…", fr: "Génération…" },
  try_copy: { en: "Copy", fr: "Copier" },
  try_copied: { en: "Copied", fr: "Copié" },
  try_reveal: { en: "Reveal", fr: "Afficher" },
  try_hide: { en: "Hide", fr: "Masquer" },
  try_disclaimer: {
    en: "Everything happens in your browser via Argon2id (hash-wasm). The page does not connect to any server.",
    fr: "Tout se passe dans votre navigateur via Argon2id (hash-wasm). La page ne se connecte à aucun serveur.",
  },
  try_back_home: { en: "Back to home", fr: "Retour à l'accueil" },
  try_min_master: {
    en: "Master password must be at least 8 characters.",
    fr: "Le mot de passe maître doit faire au moins 8 caractères.",
  },

  /* language switcher */
  lang_switcher_label: { en: "Language", fr: "Langue" },
} satisfies Record<string, Entry>;

export type StringKey = keyof typeof STRINGS;
