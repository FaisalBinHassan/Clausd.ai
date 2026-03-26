export interface Answer {
  question: string;
  answer: string;
}

export interface PartyBlock {
  label: string;
  name: string;
  details: string[];
}

export interface Section {
  number: string;
  title: string;
  content: string[];
  subsections: Section[];
}

export interface SignatureParty {
  label: string;
  fields: string[];
}

export interface DocumentAST {
  title: string;
  metadata: { key: string; value: string }[];
  parties: PartyBlock[];
  recitals: string;
  sections: Section[];
  signatureParties: SignatureParty[];
  rawText: string;
}

export interface TemplateTokens {
  fontHeading: string;
  fontBody: string;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorBackground: string;
  colorText: string;
  sectionSpacing: string;
  lineHeight: string;
}

export interface TemplateDecorations {
  headerStyle: "bar" | "block" | "stripe" | "letterhead" | "minimal" | "gradient";
  sectionNumberStyle: "plain" | "circle" | "pill" | "indent" | "underline";
  borderStyle: "none" | "single" | "double" | "left-accent";
  hasWatermark: boolean;
  hasPageBorder: boolean;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  tokens: TemplateTokens;
  decorations: TemplateDecorations;
}

export interface CustomizationOptions {
  accentColor: string | null;
  fontOverride: string | null;
  spacing: "compact" | "normal" | "spacious";
  margins: "standard" | "narrow";
}

export interface PlaceholderMap {
  [key: string]: string;
}

export type Step = "select" | "mcq" | "preview" | "template" | "final";
