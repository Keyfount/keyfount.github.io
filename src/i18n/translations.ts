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

  /* hero */
  hero_headline: { en: "Nothing to keep.", fr: "Rien à garder." },
  hero_subtitle: {
    en: "A password manager that stores nothing. Your passwords are recomputed on demand, identical on every device, with no cloud and no sync.",
    fr: "Un gestionnaire de mots de passe qui ne stocke rien. Vos mots de passe sont recalculés à la demande, identiques sur chaque appareil, sans cloud ni synchronisation.",
  },
  hero_status: {
    en: "regenerating · never stored",
    fr: "régénération · jamais stockés",
  },
  hero_cta_source: { en: "Get the source", fr: "Voir le code source" },
  hero_cta_how: { en: "How it works", fr: "Comment ça marche" },
  hero_cta_try: { en: "Try it live", fr: "Essayer en direct" },
  hero_cta_install: { en: "Install for Chrome", fr: "Installer pour Chrome" },
  hero_cta_install_soon: { en: "Pre-release", fr: "Pré-version" },
  hero_keycap_hint: { en: "press space", fr: "appuyer sur espace" },

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
  try_idle: { en: "Type a master to see the result", fr: "Tapez un maître pour voir le résultat" },
  try_settings: { en: "Settings", fr: "Réglages" },
  try_result: { en: "Result", fr: "Résultat" },
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

  /* determinism / magic moment */
  determinism_tag: { en: "the magic moment", fr: "le déclic" },
  determinism_title: {
    en: "Same inputs in, same password out.",
    fr: "Mêmes entrées, même mot de passe.",
  },
  determinism_body: {
    en: "Watch it. The same three inputs always produce the same password — anywhere, anytime. There is nothing to store because there is nothing to lose.",
    fr: "Regardez. Les mêmes trois entrées produisent toujours le même mot de passe — partout, à tout moment. Rien à stocker, donc rien à perdre.",
  },
  determinism_input_master: { en: "master", fr: "maître" },
  determinism_input_site: { en: "site", fr: "site" },
  determinism_input_email: { en: "email", fr: "email" },
  determinism_output: { en: "derived password", fr: "mot de passe dérivé" },
  determinism_action_clear: { en: "Forget it", fr: "Tout effacer" },
  determinism_action_recompute: { en: "Recompute", fr: "Recalculer" },
  determinism_action_again: { en: "Again, on this device", fr: "Encore, sur cet appareil" },
  determinism_proof_match: { en: "Identical output", fr: "Sortie identique" },
  determinism_caption: {
    en: "No network. No storage. The same function runs on every device — the extension on Chrome, the demo on this page, your phone tomorrow.",
    fr: "Pas de réseau. Pas de stockage. La même fonction tourne sur chaque appareil — l'extension Chrome, la démo de cette page, votre téléphone demain.",
  },

  /* code excerpt in Promise */
  promise_code_caption: {
    en: "The whole derivation, in seven lines of TypeScript.",
    fr: "Toute la dérivation, en sept lignes de TypeScript.",
  },
  promise_code_read: { en: "Read the full algorithm", fr: "Lire l'algorithme complet" },

  /* pull quote */
  pullquote_text: {
    en: "A vault you don't own can't be stolen, leaked, or held hostage.",
    fr: "Un coffre que vous ne possédez pas ne peut être ni volé, ni fuité, ni pris en otage.",
  },
  pullquote_attr: {
    en: "the design principle, in one line",
    fr: "le principe de conception, en une ligne",
  },

  /* FAQ / honest objections */
  faq_tag: { en: "honest objections", fr: "objections honnêtes" },
  faq_title: {
    en: "The questions you should ask.",
    fr: "Les questions que vous devez poser.",
  },
  faq_body: {
    en: "A deterministic manager is different. Different brings honest trade-offs — here are the ones that matter.",
    fr: "Un gestionnaire déterministe, c'est différent. Différent implique des compromis honnêtes — voici ceux qui comptent.",
  },
  faq_q1: {
    en: "What if I forget my master password?",
    fr: "Et si j'oublie mon mot de passe maître ?",
  },
  faq_a1: {
    en: "There is no recovery — by design. The master never leaves your head and never lives on a server, so no one (including us) can reset it. Pick a master strong enough to keep, weak enough to remember. The extension supports an optional, locally-encrypted backup hint to help you settle on one.",
    fr: "Il n'y a aucune récupération — par conception. Le maître ne quitte jamais votre tête, n'est jamais sur un serveur, donc personne (nous compris) ne peut le réinitialiser. Choisissez un maître assez fort pour durer, assez simple pour le retenir. L'extension propose un indice de sauvegarde local et chiffré pour vous aider à le fixer.",
  },
  faq_q2: {
    en: "What if a site forces me to change a password?",
    fr: "Et si un site m'oblige à changer un mot de passe ?",
  },
  faq_a2: {
    en: "Every entry has a counter. Bump it from 1 to 2 and the algorithm derives an entirely new password for the same site — no master change needed. The counter is the only thing the extension actually remembers, and it's just a small integer per domain.",
    fr: "Chaque entrée a un compteur. Passez-le de 1 à 2 et l'algorithme dérive un mot de passe entièrement neuf pour le même site — sans changer le maître. Le compteur est la seule chose que l'extension retient vraiment, et c'est un simple entier par domaine.",
  },
  faq_q3: {
    en: "How do I migrate from my current manager?",
    fr: "Comment migrer depuis mon gestionnaire actuel ?",
  },
  faq_a3: {
    en: "Gradually. Keep your existing vault read-only. For each site you actually use, log in once, change the password to a derived one, and stop syncing that entry. After a few weeks, the vault is empty and you can delete it. No risky bulk import.",
    fr: "Progressivement. Gardez votre coffre actuel en lecture seule. Pour chaque site que vous utilisez vraiment, connectez-vous une fois, remplacez le mot de passe par un mot de passe dérivé et arrêtez de synchroniser cette entrée. Au bout de quelques semaines, le coffre est vide et vous pouvez le supprimer. Aucun import en bloc risqué.",
  },
  faq_q4: {
    en: "What about sites with weird password rules?",
    fr: "Et les sites aux règles de mot de passe bizarres ?",
  },
  faq_a4: {
    en: "Each site can have its own derivation profile — length, character classes, suffix rules. The extension stores those profiles (just metadata, never the password itself) so the same site always derives a password that the site will actually accept.",
    fr: "Chaque site peut avoir son propre profil de dérivation — longueur, classes de caractères, règles de suffixe. L'extension stocke ces profils (juste les métadonnées, jamais le mot de passe) pour qu'un même site dérive toujours un mot de passe que le site acceptera.",
  },
  faq_q5: {
    en: "Can I trust an algorithm you wrote?",
    fr: "Puis-je faire confiance à un algorithme que vous avez écrit ?",
  },
  faq_a5: {
    en: "Don't. The derivation is Argon2id, the same memory-hard function recommended by OWASP and used by 1Password's secret key, applied to a small, public mixing scheme. The whole source is on GitHub under MIT, the bundle is reproducible, and the network tab stays empty when you use it. Verify, then trust — in that order.",
    fr: "Non. La dérivation, c'est Argon2id, la même fonction mémoire-intensive recommandée par OWASP, appliquée à un petit schéma de mélange public. Tout le code est sur GitHub sous licence MIT, le bundle est reproductible, et l'onglet réseau reste vide quand vous l'utilisez. Vérifiez d'abord, faites confiance ensuite.",
  },

  /* legal */
  legal_section: { en: "Legal", fr: "Mentions légales" },
  legal_terms: { en: "Terms of use", fr: "Conditions d'utilisation" },
  legal_privacy: { en: "Privacy policy", fr: "Politique de confidentialité" },
  legal_security: { en: "Security & disclosure", fr: "Sécurité & divulgation" },
  legal_last_updated: { en: "Last updated", fr: "Dernière mise à jour" },
  legal_back: { en: "Back to home", fr: "Retour à l'accueil" },

  /* language switcher */
  lang_switcher_label: { en: "Language", fr: "Langue" },
} satisfies Record<string, Entry>;

export type StringKey = keyof typeof STRINGS;
