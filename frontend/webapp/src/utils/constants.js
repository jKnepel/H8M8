const CONSTANTS = {
  CONST1: 500,
  CONST2: "Hey",
  SITEMAP: [
    { href: "/home", label: "Dashboard Home/Overview" },
    { href: "/dashboard", label: "Dashboard Statistics" },
    { href: "/moderation", label: "Moderation" },
    { href: "/settings", label: "Settings" },
    { href: "/profile", label: "Profile" },
    { href: "/logon", label: "Login" },
    { href: "/signup", label: "Request Access" },
    { href: "/info", label: "More Info" },
  ],
  ZULU_TIMESTAMP_FORMAT: "YYYY-MM-DDTHH:mm:ss.SSS[Z]",
  DEFAULT_TIMESTAMP: "LLL",
  MESSAGE_TYPES_ALL: [
    "NO_HATE",
    "NEGATIVE_STEREOTYPING",
    "DEHUMANIZATION",
    "VIOLENCE_KILLING",
    "EQUATION",
    "NORMALIZATION",
    "IRONY",
    "SLANDER",
    "SKIP",
    "NOT_PROCESSED",
  ],
  MESSAGE_TYPES_HATEFUL: [
    "NEGATIVE_STEREOTYPING",
    "DEHUMANIZATION",
    "VIOLENCE_KILLING",
    "EQUATION",
    "NORMALIZATION",
    "IRONY",
    "SLANDER",
  ],
};

export default CONSTANTS;
