import { DocumentAST, TemplateDefinition, CustomizationOptions, PlaceholderMap } from "./types";

function esc(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Extract all [PLACEHOLDER] patterns from raw text
export function extractPlaceholders(rawText: string): string[] {
  const matches = rawText.match(/\[([A-Z][A-Z\s/_]+)\]/g) || [];
  const unique = [...new Set(matches.map(m => m.slice(1, -1)))];
  return unique;
}

// Apply placeholder replacements + highlight unfilled ones in final HTML
function applyPlaceholders(html: string, placeholders: PlaceholderMap): string {
  return html.replace(/\[([A-Z][A-Z\s/_]+)\]/g, (match, key) => {
    const val = placeholders[key];
    if (val && val.trim()) {
      return `<span style="font-weight:600;color:inherit;">${val.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span>`;
    }
    return `<span style="background:#fef3c7;color:#92400e;padding:1px 4px;border-radius:3px;font-size:0.9em;">${match}</span>`;
  });
}

function resolveTokens(template: TemplateDefinition, options: CustomizationOptions) {
  const t = { ...template.tokens };
  if (options.accentColor) t.colorAccent = options.accentColor;
  if (options.fontOverride) {
    t.fontHeading = `'${options.fontOverride}', ${t.fontHeading}`;
    t.fontBody = `'${options.fontOverride}', ${t.fontBody}`;
  }
  if (options.spacing === "compact") {
    t.sectionSpacing = "1.2rem";
    t.lineHeight = "1.55";
  } else if (options.spacing === "spacious") {
    t.sectionSpacing = "2.8rem";
    t.lineHeight = "1.95";
  }
  return t;
}

// ─── SVG Decorations ─────────────────────────────────────────────────

const scalesSVG = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v19"/><path d="M5 8h14"/><path d="M3 13l2-5 2 5a3 3 0 0 1-4 0z"/><path d="M17 13l2-5 2 5a3 3 0 0 1-4 0z"/></svg>`;

const shieldSVG = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l7 4v5c0 5-3.5 9.5-7 11-3.5-1.5-7-6-7-11V6l7-4z"/><path d="M9 12l2 2 4-4"/></svg>`;

const columnSVG = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="16" width="4" height="5" rx="0.5"/><rect x="10" y="10" width="4" height="11" rx="0.5"/><rect x="17" y="4" width="4" height="17" rx="0.5"/><line x1="2" y1="21.5" x2="22" y2="21.5"/></svg>`;

// ─── Header Renderers ────────────────────────────────────────────────

function renderHeader(ast: DocumentAST, template: TemplateDefinition, tokens: ReturnType<typeof resolveTokens>, logoDataUrl: string | null): string {
  const d = template.decorations;
  const logo = logoDataUrl
    ? `<img src="${logoDataUrl}" alt="Logo" style="max-height:52px;max-width:180px;object-fit:contain;" />`
    : "";

  const metaLine = ast.metadata.length > 0
    ? ast.metadata.map(m => `<span style="margin-right:16px;"><span style="opacity:0.6;">${esc(m.key)}:</span> ${esc(m.value)}</span>`).join("")
    : "";

  switch (d.headerStyle) {
    case "bar":
      return `
        <div style="margin-bottom:36px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
            ${logo ? `<div>${logo}</div>` : `<div style="color:${tokens.colorAccent};opacity:0.3;">${scalesSVG}</div>`}
            <div style="text-align:right;font-size:10px;color:${tokens.colorSecondary};line-height:1.6;font-family:${tokens.fontBody};">${metaLine ? metaLine.replace(/margin-right:16px;/g, "").split("</span>").filter(Boolean).map(s => s + "</span>").join("<br/>") : ""}</div>
          </div>
          <div style="height:2px;background:linear-gradient(to right,${tokens.colorPrimary},${tokens.colorAccent},transparent);margin-bottom:16px;"></div>
          <h1 style="font-family:${tokens.fontHeading};font-size:26px;font-weight:700;color:${tokens.colorPrimary};margin:0;letter-spacing:0.5px;">${esc(ast.title)}</h1>
          <div style="height:3px;width:80px;background:${tokens.colorAccent};margin-top:10px;border-radius:2px;"></div>
        </div>`;

    case "block":
      return `
        <div style="background:linear-gradient(135deg,${tokens.colorPrimary} 0%,${tokens.colorAccent}dd 100%);color:#fff;padding:32px 36px;margin:-48px -48px 32px;position:relative;overflow:hidden;">
          <div style="position:absolute;top:-20px;right:-20px;opacity:0.08;transform:rotate(15deg);color:#fff;">${shieldSVG.replace('width="28"','width="120"').replace('height="28"','height="120"')}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;position:relative;">
            <div>
              <h1 style="font-family:${tokens.fontHeading};font-size:22px;font-weight:800;margin:0;letter-spacing:1.5px;text-transform:uppercase;">${esc(ast.title)}</h1>
              ${metaLine ? `<div style="margin-top:8px;font-size:11px;opacity:0.8;font-family:${tokens.fontBody};">${metaLine}</div>` : ""}
            </div>
            ${logo ? `<div style="background:#fff;padding:8px 12px;border-radius:8px;">${logo}</div>` : ""}
          </div>
        </div>`;

    case "stripe":
      return `
        <div style="display:flex;gap:24px;margin-bottom:36px;">
          <div style="width:5px;background:linear-gradient(to bottom,${tokens.colorAccent},#a78bfa,#ec4899);border-radius:4px;flex-shrink:0;"></div>
          <div style="flex:1;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
              <div>
                <h1 style="font-family:${tokens.fontHeading};font-size:28px;font-weight:700;color:${tokens.colorPrimary};margin:0;line-height:1.2;">${esc(ast.title)}</h1>
                ${metaLine ? `<div style="margin-top:10px;font-size:11px;color:${tokens.colorSecondary};font-family:${tokens.fontBody};">${metaLine}</div>` : ""}
              </div>
              ${logo ? `<div>${logo}</div>` : ""}
            </div>
          </div>
        </div>`;

    case "letterhead":
      return `
        <div style="margin-bottom:36px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;">
            <div>
              ${logo ? `<div style="margin-bottom:16px;">${logo}</div>` : `<div style="width:48px;height:48px;background:${tokens.colorPrimary};border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;margin-bottom:16px;">${shieldSVG.replace('width="28"','width="24"').replace('height="28"','height="24"')}</div>`}
            </div>
            <div style="text-align:right;max-width:250px;">
              <div style="font-size:10px;color:${tokens.colorSecondary};font-family:${tokens.fontBody};line-height:1.8;letter-spacing:0.3px;">${ast.metadata.map(m => `${esc(m.key)}: <strong>${esc(m.value)}</strong>`).join("<br/>")}</div>
            </div>
          </div>
          <div style="border-top:1px solid ${tokens.colorPrimary}22;border-bottom:1px solid ${tokens.colorPrimary}22;padding:14px 0;margin-bottom:8px;">
            <h1 style="font-family:${tokens.fontHeading};font-size:22px;font-weight:700;color:${tokens.colorPrimary};margin:0;font-variant:small-caps;letter-spacing:3px;text-align:center;">${esc(ast.title)}</h1>
          </div>
        </div>`;

    case "gradient":
      return `
        <div style="background:linear-gradient(135deg,${tokens.colorAccent},#a855f7,#ec4899);color:#fff;padding:28px 36px;margin:-48px -48px 32px;border-radius:0 0 16px 16px;position:relative;overflow:hidden;">
          <div style="position:absolute;inset:0;background:url('data:image/svg+xml,${encodeURIComponent(`<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="1" fill="rgba(255,255,255,0.1)"/></svg>`)}');"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;position:relative;">
            <div>
              <h1 style="font-family:${tokens.fontHeading};font-size:22px;font-weight:800;margin:0;letter-spacing:0.5px;">${esc(ast.title)}</h1>
              ${metaLine ? `<div style="margin-top:8px;font-size:11px;opacity:0.85;">${metaLine}</div>` : ""}
            </div>
            ${logo ? `<div style="background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);padding:8px 12px;border-radius:10px;">${logo}</div>` : ""}
          </div>
        </div>`;

    case "minimal":
    default:
      return `
        <div style="text-align:center;margin-bottom:36px;">
          ${logo ? `<div style="margin-bottom:16px;display:flex;justify-content:center;">${logo}</div>` : `<div style="display:flex;justify-content:center;margin-bottom:12px;color:${tokens.colorPrimary};opacity:0.4;">${scalesSVG}</div>`}
          <div style="border-top:2px solid ${tokens.colorPrimary};border-bottom:2px solid ${tokens.colorPrimary};padding:2px 0;margin-bottom:16px;">
            <div style="border-top:1px solid ${tokens.colorPrimary};border-bottom:1px solid ${tokens.colorPrimary};padding:12px 0;">
              <h1 style="font-family:${tokens.fontHeading};font-size:24px;font-weight:700;color:${tokens.colorPrimary};margin:0;text-transform:uppercase;letter-spacing:4px;">${esc(ast.title)}</h1>
            </div>
          </div>
          ${metaLine ? `<div style="font-size:11px;color:${tokens.colorSecondary};font-family:${tokens.fontBody};">${metaLine}</div>` : ""}
        </div>`;
  }
}

// ─── Section Number Renderers ────────────────────────────────────────

function renderSectionNumber(num: string, template: TemplateDefinition, tokens: ReturnType<typeof resolveTokens>): string {
  switch (template.decorations.sectionNumberStyle) {
    case "circle":
      return `<span style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:${tokens.colorAccent};color:#fff;font-size:12px;font-weight:700;margin-right:12px;flex-shrink:0;box-shadow:0 2px 8px ${tokens.colorAccent}33;">${esc(num)}</span>`;
    case "pill":
      return `<span style="display:inline-block;padding:3px 14px;border-radius:20px;background:${tokens.colorAccent}12;color:${tokens.colorAccent};font-size:11px;font-weight:700;margin-right:12px;border:1px solid ${tokens.colorAccent}25;">Article ${esc(num)}</span>`;
    case "indent":
      return `<span style="font-weight:700;font-size:14px;margin-right:6px;font-family:${tokens.fontHeading};">${esc(num)}.</span>`;
    case "underline":
      return `<span style="font-weight:700;margin-right:10px;font-size:13px;color:${tokens.colorAccent};font-family:${tokens.fontHeading};">\u00A7${esc(num)}</span>`;
    case "plain":
    default:
      return `<span style="font-weight:800;color:${tokens.colorAccent};margin-right:8px;font-size:16px;font-family:${tokens.fontHeading};">${esc(num)}.</span>`;
  }
}

// ─── Parties Block ───────────────────────────────────────────────────

function renderParties(ast: DocumentAST, tokens: ReturnType<typeof resolveTokens>, template: TemplateDefinition): string {
  if (ast.parties.length === 0) return "";

  const isModern = template.decorations.headerStyle === "stripe" || template.decorations.headerStyle === "gradient";

  return `
    <div style="margin:24px 0 28px;${isModern ? `background:${tokens.colorPrimary}06;border-radius:10px;padding:20px 24px;border:1px solid ${tokens.colorPrimary}0a;` : `padding:20px 24px;border-left:3px solid ${tokens.colorAccent}40;background:${tokens.colorBackground};`}">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${tokens.colorSecondary};margin-bottom:14px;font-family:${tokens.fontBody};">Parties to this Agreement</div>
      <div style="display:flex;flex-wrap:wrap;gap:24px;">
        ${ast.parties.map((p, idx) => `
          <div style="flex:1;min-width:200px;">
            <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:${tokens.colorAccent};margin-bottom:6px;font-family:${tokens.fontBody};">${idx === 0 ? "First Party" : idx === 1 ? "Second Party" : `Party ${idx + 1}`}</div>
            <div style="font-weight:700;font-size:14px;color:${tokens.colorPrimary};margin-bottom:4px;font-family:${tokens.fontHeading};">${esc(p.label)}${p.name ? `: ${esc(p.name)}` : ""}</div>
            ${p.details.map(d => `<div style="font-size:12px;color:${tokens.colorSecondary};line-height:1.6;">${esc(d)}</div>`).join("")}
          </div>
        `).join("")}
      </div>
    </div>`;
}

// ─── Recitals Block ──────────────────────────────────────────────────

function renderRecitals(ast: DocumentAST, tokens: ReturnType<typeof resolveTokens>): string {
  if (!ast.recitals) return "";
  return `
    <div style="margin:0 0 ${tokens.sectionSpacing};padding:20px 24px;background:${tokens.colorPrimary}04;border-radius:8px;border:1px solid ${tokens.colorPrimary}08;">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${tokens.colorSecondary};margin-bottom:10px;font-family:${tokens.fontBody};">Recitals</div>
      <div style="font-style:italic;font-size:13px;color:${tokens.colorSecondary};line-height:${tokens.lineHeight};font-family:${tokens.fontBody};">${esc(ast.recitals).replace(/\n\n/g, "</div><div style='height:8px;'></div><div style='font-style:italic;font-size:13px;color:${tokens.colorSecondary};line-height:${tokens.lineHeight};'>").replace(/\n/g, "<br/>")}</div>
    </div>`;
}

// ─── Signature Block ─────────────────────────────────────────────────

function renderSignatureBlock(ast: DocumentAST, tokens: ReturnType<typeof resolveTokens>, template: TemplateDefinition, signatureDataUrl: string | null): string {
  const parties = ast.signatureParties;
  if (parties.length === 0) return "";

  const sigImage = signatureDataUrl
    ? `<img src="${signatureDataUrl}" alt="Signature" style="max-height:56px;max-width:220px;object-fit:contain;display:block;margin-bottom:4px;" />`
    : "";

  const isModern = template.decorations.headerStyle === "stripe" || template.decorations.headerStyle === "gradient";

  return `
    <div style="margin-top:${tokens.sectionSpacing};padding-top:28px;">
      <div style="height:1px;background:linear-gradient(to right,${tokens.colorPrimary}20,${tokens.colorPrimary}10,transparent);margin-bottom:20px;"></div>
      <p style="font-size:13px;color:${tokens.colorSecondary};margin-bottom:28px;font-style:italic;line-height:1.7;font-family:${tokens.fontBody};">IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.</p>
      <div style="display:flex;gap:48px;flex-wrap:wrap;">
        ${parties.map((p, idx) => `
          <div style="flex:1;min-width:220px;">
            <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:${tokens.colorSecondary};margin-bottom:${sigImage && idx === 0 ? "8px" : "48px"};font-family:${tokens.fontBody};">Signed by ${esc(p.label)}</div>
            ${idx === 0 && sigImage ? `<div style="margin-bottom:8px;">${sigImage}</div>` : ""}
            <div style="border-bottom:${isModern ? `2px solid ${tokens.colorAccent}` : `1.5px solid ${tokens.colorPrimary}`};margin-bottom:10px;"></div>
            <div style="font-weight:700;font-size:14px;color:${tokens.colorPrimary};margin-bottom:2px;font-family:${tokens.fontHeading};">${esc(p.label)}</div>
            ${p.fields.map(f => `<div style="font-size:11px;color:${tokens.colorSecondary};margin:2px 0;font-family:${tokens.fontBody};">${esc(f)} <span style="color:${tokens.colorPrimary}30;">_________________</span></div>`).join("")}
          </div>
        `).join("")}
      </div>
    </div>`;
}

// ─── Main Renderer ───────────────────────────────────────────────────

export function renderDocumentHTML(
  ast: DocumentAST,
  template: TemplateDefinition,
  options: CustomizationOptions,
  logoDataUrl: string | null = null,
  signatureDataUrl: string | null = null,
  placeholders: PlaceholderMap = {}
): string {
  const tokens = resolveTokens(template, options);
  const d = template.decorations;

  const pad = options.margins === "narrow" ? "32px 28px" : "48px";
  const borderOuter = d.hasPageBorder
    ? d.borderStyle === "double"
      ? `border:3px double ${tokens.colorPrimary}40;`
      : `border:1px solid ${tokens.colorPrimary}20;`
    : "";
  const leftAccent = d.borderStyle === "left-accent"
    ? `border-left:5px solid ${tokens.colorAccent};`
    : "";

  const sectionsHTML = ast.sections.map((section, sIdx) => {
    const sNum = renderSectionNumber(section.number, template, tokens);
    const isUnderline = d.sectionNumberStyle === "underline";

    return `
      <div style="margin-bottom:${tokens.sectionSpacing};${sIdx > 0 ? `padding-top:${parseFloat(tokens.sectionSpacing) > 1.5 ? "8px" : "4px"};` : ""}">
        <div style="display:flex;align-items:center;margin-bottom:10px;">
          ${sNum}
          <h2 style="font-family:${tokens.fontHeading};font-size:15px;font-weight:700;color:${tokens.colorPrimary};margin:0;text-transform:uppercase;letter-spacing:${isUnderline ? "2px" : "0.8px"};${isUnderline ? `border-bottom:2px solid ${tokens.colorAccent}30;padding-bottom:4px;` : ""}">${esc(section.title)}</h2>
        </div>
        ${section.content.map(line => {
          const trimmed = line.trim();
          if (trimmed.startsWith("(") && trimmed.length < 120) {
            return `<div style="font-size:13px;line-height:${tokens.lineHeight};color:${tokens.colorText};margin:4px 0;padding-left:36px;font-family:${tokens.fontBody};display:flex;gap:8px;"><span style="color:${tokens.colorAccent};font-weight:600;flex-shrink:0;">${esc(trimmed.substring(0, 3))}</span><span>${esc(trimmed.substring(3).trim())}</span></div>`;
          }
          return `<div style="font-size:13px;line-height:${tokens.lineHeight};color:${tokens.colorText};margin:6px 0;padding-left:20px;font-family:${tokens.fontBody};">${esc(line)}</div>`;
        }).join("")}
        ${section.subsections.map(sub => `
          <div style="margin:12px 0 12px 20px;padding-left:16px;border-left:2px solid ${tokens.colorPrimary}0a;">
            <div style="font-size:13px;line-height:${tokens.lineHeight};color:${tokens.colorText};font-family:${tokens.fontBody};">
              <strong style="color:${tokens.colorPrimary};font-family:${tokens.fontHeading};font-size:12px;">${esc(sub.number)}</strong>
              <span style="margin-left:6px;">${sub.content.map(c => esc(c)).join(" ")}</span>
            </div>
          </div>
        `).join("")}
      </div>`;
  }).join("");

  const watermark = d.hasWatermark
    ? `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-35deg);font-size:80px;font-weight:800;color:${tokens.colorPrimary}03;letter-spacing:12px;pointer-events:none;white-space:nowrap;font-family:${tokens.fontHeading};">CONFIDENTIAL</div>`
    : "";

  // Page footer
  const pageFooter = `
    <div style="margin-top:40px;padding-top:16px;border-top:1px solid ${tokens.colorPrimary}10;display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:9px;color:${tokens.colorPrimary}30;font-family:${tokens.fontBody};">Generated by Clausd.ai</div>
      <div style="font-size:9px;color:${tokens.colorPrimary}30;font-family:${tokens.fontBody};">Page 1 of 1</div>
    </div>`;

  const rawHTML = `
    <div style="font-family:${tokens.fontBody};color:${tokens.colorText};line-height:${tokens.lineHeight};${borderOuter}">
      <div style="position:relative;background:${tokens.colorBackground};padding:${pad};${leftAccent}max-width:800px;margin:0 auto;overflow:hidden;min-height:600px;">
        ${watermark}
        ${renderHeader(ast, template, tokens, logoDataUrl)}
        ${renderParties(ast, tokens, template)}
        ${renderRecitals(ast, tokens)}
        ${sectionsHTML}
        ${renderSignatureBlock(ast, tokens, template, signatureDataUrl)}
        ${pageFooter}
      </div>
    </div>`;

  return applyPlaceholders(rawHTML, placeholders);
}

export function renderPlainText(ast: DocumentAST): string {
  return ast.rawText;
}
