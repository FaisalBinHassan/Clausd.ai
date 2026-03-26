import { DocumentAST, PartyBlock, Section, SignatureParty } from "./types";

export function parseDocument(rawText: string): DocumentAST {
  const lines = rawText.split("\n");
  const ast: DocumentAST = {
    title: "",
    metadata: [],
    parties: [],
    recitals: "",
    sections: [],
    signatureParties: [],
    rawText,
  };

  let i = 0;

  // Skip empty lines at start
  while (i < lines.length && lines[i].trim() === "") i++;

  // Title: first non-empty line (usually ALL CAPS)
  if (i < lines.length) {
    ast.title = lines[i].trim();
    i++;
  }

  // Skip empty lines
  while (i < lines.length && lines[i].trim() === "") i++;

  // Metadata: lines matching "Key: Value" before BETWEEN:
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line === "" || line.startsWith("BETWEEN") || line.startsWith("RECITAL") || /^\d+\./.test(line)) break;
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0 && colonIdx < 30) {
      ast.metadata.push({
        key: line.substring(0, colonIdx).trim(),
        value: line.substring(colonIdx + 1).trim(),
      });
    }
    i++;
  }

  // Skip empty lines
  while (i < lines.length && lines[i].trim() === "") i++;

  // Parties: between BETWEEN: and RECITALS / first numbered section
  if (i < lines.length && lines[i].trim().startsWith("BETWEEN")) {
    i++; // skip BETWEEN line
    while (i < lines.length && lines[i].trim() === "") i++;

    let currentParty: PartyBlock | null = null;
    while (i < lines.length) {
      const line = lines[i].trim();
      if (line.startsWith("RECITAL") || line.startsWith("WHEREAS") || line.startsWith("NOW,") || /^\d+\./.test(line)) break;

      if (line.startsWith("Party") || line.startsWith("Employer") || line.startsWith("Employee") ||
          line.startsWith("Client") || line.startsWith("Service Provider") || line.startsWith("AND")) {
        if (line === "AND" || line === "AND:") {
          i++;
          while (i < lines.length && lines[i].trim() === "") i++;
          continue;
        }
        if (currentParty) ast.parties.push(currentParty);
        const colonIdx = line.indexOf(":");
        currentParty = {
          label: colonIdx > 0 ? line.substring(0, colonIdx).trim() : line,
          name: colonIdx > 0 ? line.substring(colonIdx + 1).trim() : "",
          details: [],
        };
      } else if (currentParty && line !== "") {
        currentParty.details.push(line);
      }
      i++;
    }
    if (currentParty) ast.parties.push(currentParty);
  }

  // Skip empty lines
  while (i < lines.length && lines[i].trim() === "") i++;

  // Recitals
  const recitalLines: string[] = [];
  while (i < lines.length) {
    const line = lines[i].trim();
    if (/^\d+\.\s+[A-Z]/.test(line)) break;
    if (line.startsWith("RECITAL") || line.startsWith("WHEREAS") || line.startsWith("NOW,") || line.startsWith("(")) {
      recitalLines.push(line);
    } else if (recitalLines.length > 0 && line !== "") {
      recitalLines.push(line);
    } else if (recitalLines.length > 0 && line === "") {
      recitalLines.push("");
    }
    if (recitalLines.length === 0 && line === "") {
      // Still looking for recitals or sections
    }
    i++;
    if (/^\d+\.\s+[A-Z]/.test(lines[i]?.trim() || "")) break;
  }
  ast.recitals = recitalLines.join("\n").trim();

  // Sections: numbered sections until IN WITNESS WHEREOF
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.startsWith("IN WITNESS WHEREOF") || line.startsWith("_____")) break;

    const sectionMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (sectionMatch) {
      const section: Section = {
        number: sectionMatch[1],
        title: sectionMatch[2].trim(),
        content: [],
        subsections: [],
      };
      i++;

      // Collect content and subsections
      while (i < lines.length) {
        const subLine = lines[i].trim();
        if (subLine.startsWith("IN WITNESS WHEREOF") || subLine.startsWith("_____")) break;

        // New top-level section
        if (/^\d+\.\s+[A-Z]/.test(subLine) && !subLine.match(/^\d+\.\d+/)) break;

        // Subsection
        const subMatch = subLine.match(/^(\d+\.\d+)\s+(.*)/);
        if (subMatch) {
          const subsection: Section = {
            number: subMatch[1],
            title: "",
            content: [subMatch[2]],
            subsections: [],
          };
          i++;
          // Collect subsection content (indented lines, list items)
          while (i < lines.length) {
            const ssLine = lines[i].trim();
            if (ssLine === "" || /^\d+\./.test(ssLine) || ssLine.startsWith("IN WITNESS") || ssLine.startsWith("_____")) break;
            subsection.content.push(ssLine);
            i++;
          }
          section.subsections.push(subsection);
        } else if (subLine !== "") {
          section.content.push(subLine);
          i++;
        } else {
          i++;
        }
      }
      ast.sections.push(section);
    } else {
      i++;
    }
  }

  // Signature block: from IN WITNESS WHEREOF to end
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.startsWith("IN WITNESS WHEREOF") || line.startsWith("_____")) break;
    i++;
  }

  // Parse signature parties
  if (i < lines.length) {
    // Skip the IN WITNESS WHEREOF line
    while (i < lines.length && !lines[i].trim().startsWith("_____")) i++;

    let currentSigParty: SignatureParty | null = null;
    while (i < lines.length) {
      const line = lines[i].trim();
      if (line.startsWith("_____")) {
        if (currentSigParty) ast.signatureParties.push(currentSigParty);
        currentSigParty = { label: "", fields: [] };
      } else if (currentSigParty) {
        if (currentSigParty.label === "" && line !== "") {
          currentSigParty.label = line;
        } else if (line !== "") {
          currentSigParty.fields.push(line);
        }
      }
      i++;
    }
    if (currentSigParty && currentSigParty.label) {
      ast.signatureParties.push(currentSigParty);
    }
  }

  // Fallback: if no signature parties found, create default ones
  if (ast.signatureParties.length === 0) {
    ast.signatureParties = [
      { label: "Party A", fields: ["Name:", "Title:", "Date:"] },
      { label: "Party B", fields: ["Name:", "Title:", "Date:"] },
    ];
  }

  return ast;
}
