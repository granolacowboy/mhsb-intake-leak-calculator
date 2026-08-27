/**
 * Every client-visible string in the tool. This module is the brand-lint
 * target (client-visible copy only). Keep it free of em and en dashes, banned
 * phrases, legacy hexes, and retired fonts. Voice: seasoned operator, direct,
 * zero fluff, no hype, no guarantees.
 */

/** CTA destination. The only outbound link constant. No email capture. */
export const DIAGNOSTIC_URL = "https://www.mhsbsolutions.com/consultation/";

export const SITE_URL = "https://www.mhsbsolutions.com/";

export const COPY = {
  brand: "MHSB Solutions",
  tagline: "Intelligent Automation for Law Firms",

  hero: {
    eyebrow: "Free intake diagnostic",
    title: "Intake revenue leak calculator",
    lede: "See what unanswered calls, slow responses, thin follow-up, consult no-shows, and unsigned engagement letters cost your firm each year. It takes about 3 minutes, and every benchmark is yours to change.",
  },

  form: {
    heading: "Your intake numbers",
    inquiries: {
      label: "New inquiries per month",
      help: "Calls, web forms, and referrals from prospective clients that reach your firm.",
    },
    practiceArea: {
      label: "Practice area",
      help: "Pre-fills an illustrative matter value. Replace it with your own.",
    },
    matterValue: {
      label: "Average value of a signed matter",
      help: "The single biggest driver. Clio 2024 reports an average lawyer rate near $341 per hour, from roughly $461 (corporate) down to $135 (juvenile). Enter the number your firm actually earns per signed client.",
    },
    answerRate: {
      label: "Calls and inquiries you actually answer",
      help: "Clio 2024 found only about 40 percent of firms answered a prospective client call, and 48 percent were essentially unreachable by phone.",
    },
    responseTime: {
      label: "Typical time to first response",
      help: "Speed of first contact strongly affects whether a lead engages.",
    },
    followupAttempts: {
      label: "Follow-up attempts before you stop",
      help: "How many times your team reaches out before giving up on a lead.",
    },
    showRate: {
      label: "Booked consults that show up",
      help: "The share of scheduled consultations that are actually attended.",
    },
    signingRate: {
      label: "Consults that sign an engagement letter",
      help: "The share of attended consultations that become signed clients.",
    },
    advancedToggle: "Adjust benchmarks and close rate",
    advancedIntro:
      "These are the improved targets the estimate compares against, plus the rate at which signed matters become paying work. All of them are assumptions, and every one is editable.",
    targetPrefix: "Target",
    closeRate: {
      label: "Signed matters that become paying work",
      help: "Applied to every stage as the value of a signed engagement letter.",
    },
    reset: "Reset to defaults",
  },

  results: {
    heading: "What your intake is leaking",
    headlineLabel: "Estimated annual revenue you could recover",
    headlineSub:
      "By closing the gaps below to the target benchmarks. This is a modeled estimate, not a guarantee, and it moves with the numbers you enter.",
    capturedLabel: "You currently capture about",
    capturedSuffix: "per year in signed matters.",
    mattersLabel: "Recoverable signed matters per year",
    breakdownHeading: "Where the money leaks",
    basisNote:
      "Only the current answer rate has a primary source (Clio 2024). Every figure here, including the dollar amounts, also depends on assumptions you can change.",
    shareSuffix: "of the total",
    emptyState:
      "Enter your numbers above to see the estimate. At zero inquiries there is nothing to recover.",
    atTargetNote: "At or above target. No leak here.",
  },

  stages: {
    answer: {
      label: "Unanswered calls and inquiries",
      note: "Prospective clients who never reach a person.",
    },
    response: {
      label: "Slow first response",
      note: "Leads lost because the first reply came too late.",
    },
    followup: {
      label: "Insufficient follow-up",
      note: "Leads that needed another touch and did not get one.",
    },
    show: {
      label: "Consultation no-shows",
      note: "Booked consults that were never attended.",
    },
    signing: {
      label: "Unsigned engagement letters",
      note: "Consults that ended without a signed client.",
    },
  },

  badges: {
    sourced: "Sourced",
    sourcedTitle:
      "The default here is drawn from a dated, cited source (Clio 2024). Your own number replaces it.",
    assumption: "Assumption",
    assumptionTitle:
      "No primary source exists for this default. It is a starting point. Replace it with your own.",
  },

  actions: {
    print: "Print summary",
    copyLink: "Copy share link",
    copyLinkDone: "Link copied",
  },

  cta: {
    heading: "Turn this estimate into a plan",
    body: "A Phase 1 intake diagnostic maps where your firm actually loses prospective clients, then shows what to fix first. No obligation.",
    button: "Book your intake diagnostic",
  },

  methodology: {
    heading: "How this is calculated",
    body: "Each stage figure is the revenue you could recover by improving that one stage to its target, holding the others where they are today. The five figures add up to the headline. This is deliberately conservative: it values every recovered lead at your current downstream conversion and ignores the compounding you would get from fixing several stages at once. Full method and every coefficient are documented in the model.",
    sourcesHeading: "Sources",
    sources: [
      "Clio 2024 Legal Trends Report (9th edition, October 2024): answer rates and intake technology impact.",
      "MIT and InsideSales Lead Response Management Study, 2007: response speed affects contact and qualify odds, not conversion.",
      "Harvard Business Review, The Short Life of Online Sales Leads, 2011: response-time audit.",
      "Clio Compare Lawyer Rates: average hourly rate by practice area.",
    ],
    assumptionsNote:
      "Follow-up, no-show, signing, and matter-value figures have no primary industry source. They ship as clearly marked assumptions, and you should replace them with your firm data.",
    accessed: "Sources accessed August 2026.",
  },

  footer: {
    line: "Safe AI adoption. Defensible operations. Measurable outcomes.",
    home: "mhsbsolutions.com",
    disclaimer:
      "This tool runs entirely in your browser. It captures no data, sets no tracking, and sends nothing anywhere.",
  },
} as const;
