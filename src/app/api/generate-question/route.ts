import { NextRequest, NextResponse } from "next/server";

interface MCQRequest {
  documentType: string;
  previousAnswers: { question: string; answer: string }[];
}

const questionBank: Record<string, { question: string; options: string[] }[]> = {
  nda: [
    {
      question: "What jurisdiction should this NDA be governed by?",
      options: ["United Kingdom", "United States", "European Union", "GCC / Middle East", "Other"],
    },
    {
      question: "Is this a mutual or one-way NDA?",
      options: [
        "Mutual — both parties share confidential information",
        "One-way — only one party discloses",
        "Not sure — help me decide",
      ],
    },
    {
      question: "How long should the confidentiality obligation last?",
      options: ["1 year", "2 years", "5 years", "Indefinite", "Custom duration"],
    },
    {
      question: "What type of confidential information is being protected?",
      options: [
        "Trade secrets & proprietary technology",
        "Business plans & financial data",
        "Client data & contact lists",
        "All of the above",
        "Other — I'll specify",
      ],
    },
    {
      question: "What happens if someone breaches this NDA?",
      options: [
        "Financial damages only",
        "Injunctive relief (court order to stop)",
        "Both damages and injunctive relief",
        "Termination of business relationship",
      ],
    },
    {
      question: "Who are the parties involved?",
      options: [
        "Two individuals",
        "Individual and a company",
        "Two companies",
        "Company and a freelancer/contractor",
      ],
    },
    {
      question: "Should the NDA include non-solicitation clauses?",
      options: [
        "Yes — prevent poaching of employees/clients",
        "No — keep it strictly confidentiality",
        "Not sure — recommend for me",
      ],
    },
    {
      question: "Are there any exclusions from confidential information?",
      options: [
        "Publicly available information",
        "Information already known to the recipient",
        "Information obtained from third parties",
        "All standard exclusions",
        "Custom exclusions",
      ],
    },
  ],
  employment: [
    {
      question: "What jurisdiction governs this employment contract?",
      options: ["United Kingdom", "United States", "European Union", "GCC / Middle East", "Other"],
    },
    {
      question: "What type of employment is this?",
      options: ["Full-time permanent", "Part-time permanent", "Fixed-term contract", "Zero-hours contract", "Internship/Apprenticeship"],
    },
    {
      question: "What is the notice period for termination?",
      options: ["1 week", "1 month", "3 months", "Statutory minimum", "Custom"],
    },
    {
      question: "Should the contract include a probationary period?",
      options: ["Yes — 3 months", "Yes — 6 months", "No probation period", "Custom duration"],
    },
    {
      question: "Does this role include restrictive covenants?",
      options: [
        "Non-compete clause",
        "Non-solicitation clause",
        "Both non-compete and non-solicitation",
        "No restrictive covenants",
      ],
    },
    {
      question: "What benefits should be included?",
      options: [
        "Pension & healthcare",
        "Stock options / equity",
        "Performance bonuses",
        "Standard statutory benefits only",
        "Custom benefits package",
      ],
    },
    {
      question: "Is there an IP assignment clause needed?",
      options: [
        "Yes — all work product belongs to employer",
        "Yes — with exceptions for personal projects",
        "No IP clause needed",
        "Not sure — recommend for me",
      ],
    },
    {
      question: "What are the working arrangements?",
      options: ["Fully on-site", "Fully remote", "Hybrid (flexible)", "Field-based / Travel required"],
    },
  ],
  service: [
    {
      question: "What jurisdiction governs this service agreement?",
      options: ["United Kingdom", "United States", "European Union", "GCC / Middle East", "Other"],
    },
    {
      question: "What type of service is being provided?",
      options: [
        "Professional/consulting services",
        "Software/technology services",
        "Creative/design services",
        "Marketing services",
        "Other services",
      ],
    },
    {
      question: "How will the service provider be compensated?",
      options: [
        "Fixed project fee",
        "Hourly/daily rate",
        "Monthly retainer",
        "Milestone-based payments",
        "Revenue share / Commission",
      ],
    },
    {
      question: "What payment terms should apply?",
      options: ["Payment on delivery", "Net 14 days", "Net 30 days", "Net 60 days", "50% upfront, 50% on completion"],
    },
    {
      question: "Should the agreement include a liability cap?",
      options: [
        "Yes — capped at contract value",
        "Yes — capped at a specific amount",
        "Unlimited liability",
        "Not sure — recommend for me",
      ],
    },
    {
      question: "Who owns the intellectual property created?",
      options: [
        "Client owns all IP",
        "Service provider retains IP, client gets license",
        "Joint ownership",
        "IP transfers on full payment",
      ],
    },
    {
      question: "What is the termination clause?",
      options: [
        "Either party with 30 days notice",
        "Either party with 14 days notice",
        "For cause only",
        "Fixed term — no early termination",
        "Custom terms",
      ],
    },
    {
      question: "Should there be a confidentiality clause included?",
      options: [
        "Yes — mutual confidentiality",
        "Yes — one-way (client info protected)",
        "No — not needed",
        "Separate NDA already in place",
      ],
    },
  ],
  founder: [
    {
      question: "What jurisdiction governs this founder agreement?",
      options: ["United Kingdom", "United States", "European Union", "Other"],
    },
    {
      question: "How many co-founders are involved?",
      options: ["2 co-founders", "3 co-founders", "4+ co-founders"],
    },
    {
      question: "How will equity be split?",
      options: ["Equal split", "Based on contribution", "Based on roles", "Custom allocation", "Not decided yet — help us"],
    },
    {
      question: "Should there be a vesting schedule?",
      options: [
        "Yes — 4-year vesting with 1-year cliff",
        "Yes — 3-year vesting with 6-month cliff",
        "No vesting — immediate ownership",
        "Custom schedule",
      ],
    },
    {
      question: "What happens if a founder leaves?",
      options: [
        "Good leaver / bad leaver provisions",
        "Buy-back at fair market value",
        "Forfeiture of unvested shares",
        "Not sure — recommend for me",
      ],
    },
    {
      question: "How will decisions be made?",
      options: [
        "Majority vote",
        "Unanimous consent for major decisions",
        "CEO has final say",
        "Board vote",
      ],
    },
    {
      question: "Is IP assignment included?",
      options: [
        "Yes — all founder IP transfers to company",
        "Yes — with specific exclusions",
        "No — founders retain their IP",
        "Not sure — recommend",
      ],
    },
  ],
  privacy: [
    {
      question: "What jurisdiction does this privacy policy need to comply with?",
      options: ["UK (UK GDPR)", "EU (GDPR)", "US (state-level, e.g. CCPA)", "Multiple jurisdictions", "Other"],
    },
    {
      question: "What type of personal data do you collect?",
      options: [
        "Names and contact info only",
        "Payment/financial data",
        "Health or sensitive data",
        "Behavioral/analytics data",
        "All of the above",
      ],
    },
    {
      question: "How do you collect personal data?",
      options: [
        "Website forms",
        "Cookies and tracking",
        "Third-party integrations",
        "All of the above",
        "Other methods",
      ],
    },
    {
      question: "Do you share data with third parties?",
      options: [
        "Yes — with service providers/processors",
        "Yes — with advertising partners",
        "Yes — with both",
        "No — data stays internal",
      ],
    },
    {
      question: "Do you transfer data internationally?",
      options: [
        "Yes — EU to US transfers",
        "Yes — UK to non-adequate countries",
        "Yes — multiple international transfers",
        "No — data stays in one jurisdiction",
      ],
    },
    {
      question: "Do you have a Data Protection Officer?",
      options: ["Yes", "No, but we plan to appoint one", "No — not required", "Not sure if we need one"],
    },
  ],
  contractor: [
    {
      question: "What jurisdiction governs this contractor agreement?",
      options: ["United Kingdom", "United States", "European Union", "GCC / Middle East", "Other"],
    },
    {
      question: "What type of work will the contractor perform?",
      options: [
        "Software development",
        "Design/creative work",
        "Consulting/advisory",
        "Marketing/content",
        "Other services",
      ],
    },
    {
      question: "How will the contractor be paid?",
      options: ["Hourly rate", "Daily rate", "Fixed project fee", "Monthly retainer", "Milestone payments"],
    },
    {
      question: "Who owns the work product?",
      options: [
        "Client owns everything",
        "Contractor retains IP, client gets license",
        "IP transfers on payment",
        "Joint ownership",
      ],
    },
    {
      question: "Is the contractor exclusive to your company?",
      options: [
        "Yes — exclusive engagement",
        "No — contractor can work with others",
        "Non-exclusive but no direct competitors",
      ],
    },
    {
      question: "What is the engagement duration?",
      options: [
        "One-off project",
        "3 months",
        "6 months",
        "12 months",
        "Ongoing until terminated",
      ],
    },
    {
      question: "Should there be a confidentiality clause?",
      options: [
        "Yes — mutual confidentiality",
        "Yes — contractor must keep info confidential",
        "Separate NDA in place",
        "No — not needed",
      ],
    },
  ],
  terms: [
    {
      question: "What jurisdiction governs these terms of service?",
      options: ["United Kingdom", "United States", "European Union", "Multiple jurisdictions", "Other"],
    },
    {
      question: "What type of service/platform are these terms for?",
      options: [
        "SaaS / web application",
        "E-commerce / marketplace",
        "Mobile app",
        "Content/media platform",
        "Professional services",
      ],
    },
    {
      question: "Do users create accounts?",
      options: ["Yes — account registration required", "No — guest access only", "Both — optional accounts"],
    },
    {
      question: "Is there a payment/subscription component?",
      options: [
        "Yes — subscription model",
        "Yes — one-time purchases",
        "Yes — both subscriptions and purchases",
        "No — free service",
        "Freemium model",
      ],
    },
    {
      question: "Can users submit or upload content?",
      options: [
        "Yes — user-generated content",
        "Yes — file uploads only",
        "No — content is provider-only",
      ],
    },
    {
      question: "How should disputes be resolved?",
      options: [
        "Court litigation",
        "Binding arbitration",
        "Mediation first, then litigation",
        "Not sure — recommend for me",
      ],
    },
  ],
};

function getQuestionsForType(docType: string): { question: string; options: string[] }[] {
  const key = docType.toLowerCase().replace(/[^a-z]/g, "");

  const typeMap: Record<string, string> = {
    nda: "nda",
    nondisclosureagreement: "nda",
    employmentcontract: "employment",
    employment: "employment",
    serviceagreement: "service",
    service: "service",
    founderagreement: "founder",
    founder: "founder",
    privacypolicy: "privacy",
    privacy: "privacy",
    contractoragreement: "contractor",
    contractor: "contractor",
    termsofservice: "terms",
    terms: "terms",
  };

  const mapped = typeMap[key];
  if (mapped && questionBank[mapped]) {
    return questionBank[mapped];
  }

  // Default generic questions for any document type
  return [
    {
      question: `What jurisdiction should this ${docType} be governed by?`,
      options: ["United Kingdom", "United States", "European Union", "GCC / Middle East", "Other"],
    },
    {
      question: "Who are the parties involved?",
      options: ["Two individuals", "Individual and a company", "Two companies", "Multiple parties"],
    },
    {
      question: "What is the intended duration of this agreement?",
      options: ["One-time/project-based", "1 year", "2 years", "Ongoing until terminated", "Custom"],
    },
    {
      question: "Should there be a confidentiality clause?",
      options: ["Yes — mutual", "Yes — one-way", "No", "Not sure"],
    },
    {
      question: "How should disputes be resolved?",
      options: ["Court litigation", "Arbitration", "Mediation", "Not sure — recommend for me"],
    },
    {
      question: "Should there be a liability cap?",
      options: ["Yes — capped at contract value", "Yes — specific amount", "Unlimited", "Not sure"],
    },
    {
      question: "What termination provisions should apply?",
      options: [
        "Either party with 30 days notice",
        "For cause only",
        "Fixed term — no early exit",
        "Custom terms",
      ],
    },
  ];
}

// Adaptive follow-up questions generated based on previous answers
function generateFollowUp(docType: string, previousAnswers: { question: string; answer: string }[]): { question: string; options: string[] } | null {
  const answered = new Set(previousAnswers.map(a => a.question.toLowerCase()));
  const lastAnswer = previousAnswers[previousAnswers.length - 1];

  // Context-aware follow-ups based on what was just answered
  const followUps: { trigger: RegExp; question: string; options: string[] }[] = [
    { trigger: /jurisdiction.*uk|united kingdom/i, question: "Which UK legal system applies?", options: ["England & Wales", "Scotland", "Northern Ireland", "All UK jurisdictions"] },
    { trigger: /jurisdiction.*us|united states/i, question: "Which US state law governs this agreement?", options: ["Delaware", "New York", "California", "Texas", "Other state"] },
    { trigger: /jurisdiction.*eu|european/i, question: "Which EU member state's law applies?", options: ["Germany", "France", "Netherlands", "Ireland", "Other EU state"] },
    { trigger: /mutual/i, question: "Should both parties have equal obligations, or different levels?", options: ["Equal obligations for both", "Stronger obligations on one party", "Not sure — keep it balanced"] },
    { trigger: /trade secret|proprietary/i, question: "Do you need specific protections for source code or algorithms?", options: ["Yes — software/code protection needed", "No — general trade secrets only", "Not applicable"] },
    { trigger: /client data|personal data/i, question: "Does this involve processing personal data under GDPR?", options: ["Yes — GDPR compliance needed", "No — business data only", "Not sure"] },
    { trigger: /full.time|permanent/i, question: "Will the employee have access to company IP or trade secrets?", options: ["Yes — significant IP access", "Limited access only", "No sensitive IP involved"] },
    { trigger: /remote|hybrid/i, question: "Which country/region will the remote worker be based in?", options: ["Same jurisdiction as employer", "Different country — within EU/UK", "International — outside EU/UK", "Multiple locations"] },
    { trigger: /stock|equity|option/i, question: "What type of equity compensation?", options: ["Stock options (ISO/NSO)", "Restricted stock units (RSUs)", "Phantom equity / SAR", "Direct share grant"] },
    { trigger: /fixed.*fee|project.*fee/i, question: "How will project milestones be defined?", options: ["Deliverable-based milestones", "Time-based phases", "Single delivery at completion", "Custom milestone schedule"] },
    { trigger: /hourly|daily.*rate/i, question: "Is there a cap on total hours/days?", options: ["Yes — monthly cap", "Yes — project total cap", "No cap — open-ended", "To be agreed per project"] },
    { trigger: /ip.*client|client.*owns/i, question: "Should pre-existing IP be excluded from the transfer?", options: ["Yes — pre-existing IP stays with creator", "No — all IP transfers", "License-back arrangement for pre-existing IP"] },
    { trigger: /vesting|cliff/i, question: "What triggers accelerated vesting?", options: ["Change of control / acquisition", "Termination without cause", "Both of the above", "No acceleration provisions"] },
    { trigger: /gdpr|data protection/i, question: "Do you need a Data Processing Agreement (DPA) clause?", options: ["Yes — include DPA terms", "Separate DPA will be signed", "Not applicable"] },
    { trigger: /penalty|damages|injunctive/i, question: "Should there be a liquidated damages clause with a specific amount?", options: ["Yes — specify a fixed penalty amount", "No — rely on actual damages", "Include a minimum damages floor", "Not sure — recommend for me"] },
    { trigger: /non.compete|non.solicitation/i, question: "What geographic scope for restrictive covenants?", options: ["Same city/region only", "Nationwide", "International", "No geographic restriction"] },
    { trigger: /termination|notice/i, question: "Should there be a cure period before termination for breach?", options: ["Yes — 14 days to cure", "Yes — 30 days to cure", "No — immediate termination for breach", "Depends on the type of breach"] },
    { trigger: /arbitration/i, question: "Which arbitration institution should govern disputes?", options: ["LCIA (London)", "ICC (International)", "AAA / JAMS (US)", "Ad hoc arbitration"] },
    { trigger: /subscription|saas/i, question: "Should auto-renewal be included?", options: ["Yes — auto-renew annually", "Yes — auto-renew monthly", "No — manual renewal required", "Auto-renew with opt-out notice period"] },
    { trigger: /freelanc|contractor/i, question: "Should there be an IR35 / worker classification clause?", options: ["Yes — confirm independent contractor status", "Not applicable", "Include mutual indemnification for misclassification"] },
  ];

  // Find a follow-up that matches the last answer and hasn't been asked yet
  for (const fu of followUps) {
    if (fu.trigger.test(lastAnswer?.answer || "") && !answered.has(fu.question.toLowerCase())) {
      return fu;
    }
  }

  // General deepening questions that can apply to any document
  const generalFollowUps: { question: string; options: string[] }[] = [
    { question: "Should this agreement include a force majeure (Act of God) clause?", options: ["Yes — standard force majeure", "Yes — include pandemic/epidemic specifically", "No — not needed", "Not sure — recommend for me"] },
    { question: "How should amendments to this agreement be handled?", options: ["Written consent of both parties", "Email confirmation sufficient", "Formal signed amendment only", "Any reasonable written notice"] },
    { question: "Should the agreement include an entire agreement clause?", options: ["Yes — supersedes all prior agreements", "No — prior agreements may still apply", "Not sure — recommend for me"] },
    { question: "Do you need specific insurance requirements?", options: ["Yes — professional indemnity insurance", "Yes — public liability insurance", "Both professional and public liability", "No insurance requirements"] },
    { question: "Should there be a non-waiver clause?", options: ["Yes — failure to enforce doesn't waive rights", "No — not needed", "Not sure — recommend for me"] },
    { question: "How should notices be delivered under this agreement?", options: ["Email only", "Registered post / courier", "Both email and physical post", "Any written form"] },
    { question: "Should there be a severability clause?", options: ["Yes — invalid provisions don't affect the rest", "No — agreement stands as a whole", "Not sure — recommend for me"] },
    { question: "Do you want to include a counterparts clause for signing?", options: ["Yes — allow signing in counterparts", "Yes — include electronic signature provision", "No — single original only"] },
  ];

  for (const gfu of generalFollowUps) {
    if (!answered.has(gfu.question.toLowerCase())) {
      return gfu;
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body: MCQRequest = await req.json();
    const { documentType, previousAnswers } = body;

    const baseQuestions = getQuestionsForType(documentType);
    const answeredCount = previousAnswers.length;

    // Phase 1: Serve base questions
    if (answeredCount < baseQuestions.length) {
      const nextQ = baseQuestions[answeredCount];
      const options = [...nextQ.options];
      if (!options.some((o) => o.toLowerCase().includes("other"))) {
        options.push("Other — I'll specify");
      }

      return NextResponse.json({
        done: false,
        question: nextQ.question,
        options,
        questionNumber: answeredCount + 1,
        totalQuestions: null, // null = unlimited, UI won't show "X of Y"
        phase: "core",
      });
    }

    // Phase 2: Adaptive follow-up questions based on previous answers
    const followUp = generateFollowUp(documentType, previousAnswers);
    if (followUp) {
      const options = [...followUp.options];
      if (!options.some((o) => o.toLowerCase().includes("other"))) {
        options.push("Other — I'll specify");
      }

      return NextResponse.json({
        done: false,
        question: followUp.question,
        options,
        questionNumber: answeredCount + 1,
        totalQuestions: null,
        phase: "follow-up",
      });
    }

    // Phase 3: No more questions available
    return NextResponse.json({ done: true, question: null, options: null });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
