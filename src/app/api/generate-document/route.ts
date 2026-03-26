import { NextRequest, NextResponse } from "next/server";

interface DocumentRequest {
  documentType: string;
  answers: { question: string; answer: string }[];
}

function generateDocument(docType: string, answers: { question: string; answer: string }[]): string {
  const answerMap: Record<string, string> = {};
  answers.forEach((a) => {
    answerMap[a.question] = a.answer;
  });

  const jurisdiction =
    answers.find((a) => a.question.toLowerCase().includes("jurisdiction"))?.answer || "United Kingdom";
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const type = docType.toLowerCase();

  if (type.includes("nda") || type.includes("non-disclosure")) {
    const mutual = answers.find((a) => a.question.toLowerCase().includes("mutual"))?.answer || "";
    const isMutual = mutual.toLowerCase().includes("mutual");
    const duration =
      answers.find((a) => a.question.toLowerCase().includes("duration") || a.question.toLowerCase().includes("long"))
        ?.answer || "2 years";
    const infoType =
      answers.find((a) => a.question.toLowerCase().includes("confidential information") || a.question.toLowerCase().includes("protected"))
        ?.answer || "All of the above";
    const breach =
      answers.find((a) => a.question.toLowerCase().includes("breach"))?.answer || "Both damages and injunctive relief";
    const parties =
      answers.find((a) => a.question.toLowerCase().includes("parties"))?.answer || "Two companies";

    return `NON-DISCLOSURE AGREEMENT

Date: ${today}
Jurisdiction: ${jurisdiction}
Type: ${isMutual ? "Mutual" : "One-Way"} NDA

BETWEEN:

Party A: [PARTY A NAME]
Address: [PARTY A ADDRESS]
("${isMutual ? "First " : ""}Disclosing Party")

AND

Party B: [PARTY B NAME]
Address: [PARTY B ADDRESS]
("${isMutual ? "Second Disclosing Party" : "Receiving Party"}")

(${parties})

RECITALS

WHEREAS, the parties wish to explore a potential business relationship and, in connection with this, may disclose certain confidential and proprietary information to ${isMutual ? "each other" : "the Receiving Party"}.

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:

1. DEFINITIONS

1.1 "Confidential Information" means any and all non-public, proprietary, or confidential information disclosed by ${isMutual ? "either party" : "the Disclosing Party"} to ${isMutual ? "the other party" : "the Receiving Party"}, whether orally, in writing, electronically, or by any other means, including but not limited to:

${infoType.includes("All") ? `    (a) Trade secrets and proprietary technology;
    (b) Business plans, strategies, and financial data;
    (c) Client data, contact lists, and customer information;
    (d) Product designs, specifications, and prototypes;
    (e) Marketing plans and sales strategies;
    (f) Any other information designated as confidential.` : `    (a) ${infoType};
    (b) Any related documentation, materials, or data;
    (c) Any other information designated as confidential.`}

1.2 "Confidential Information" does not include information that:
    (a) Is or becomes publicly available through no fault of the Receiving Party;
    (b) Was known to the Receiving Party prior to disclosure;
    (c) Is independently developed by the Receiving Party without use of the Confidential Information;
    (d) Is rightfully obtained from a third party without restriction on disclosure.

2. OBLIGATIONS

2.1 ${isMutual ? "Each party" : "The Receiving Party"} agrees to:
    (a) Hold all Confidential Information in strict confidence;
    (b) Not disclose Confidential Information to any third party without prior written consent;
    (c) Use Confidential Information solely for the purpose of evaluating the potential business relationship;
    (d) Restrict access to Confidential Information to those employees and advisors who need to know;
    (e) Take all reasonable measures to protect the confidentiality of the information.

2.2 ${isMutual ? "Each party" : "The Receiving Party"} may disclose Confidential Information if required by law, provided that ${isMutual ? "the disclosing party" : "it"} gives prompt written notice to ${isMutual ? "the other party" : "the Disclosing Party"} and cooperates in any efforts to obtain protective treatment.

3. DURATION

3.1 The obligations of confidentiality shall remain in effect for a period of ${duration} from the date of this Agreement.

3.2 Upon termination or expiry, ${isMutual ? "each party" : "the Receiving Party"} shall promptly return or destroy all Confidential Information and confirm in writing that it has done so.

4. REMEDIES FOR BREACH

4.1 ${isMutual ? "Each party acknowledges" : "The Receiving Party acknowledges"} that a breach of this Agreement may cause irreparable harm for which monetary damages alone would be inadequate.

4.2 In the event of a breach, the non-breaching party shall be entitled to:
${breach.includes("Both") || breach.includes("damages") ? "    (a) Seek monetary damages for any losses suffered;" : ""}
${breach.includes("Both") || breach.includes("njunctive") ? `    (${breach.includes("Both") ? "b" : "a"}) Seek injunctive relief to prevent further breaches;` : ""}
    (${breach.includes("Both") ? "c" : "b"}) Recover reasonable legal costs and expenses.

5. GENERAL PROVISIONS

5.1 Governing Law. This Agreement shall be governed by and construed in accordance with the laws of ${jurisdiction}.

5.2 Entire Agreement. This Agreement constitutes the entire agreement between the parties regarding the subject matter hereof and supersedes all prior agreements and understandings.

5.3 Amendment. This Agreement may only be amended in writing signed by both parties.

5.4 Severability. If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.

5.5 No Waiver. The failure of either party to enforce any provision of this Agreement shall not constitute a waiver of such provision or the right to enforce it at a later time.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

_________________________          _________________________
Party A                            Party B
Name:                              Name:
Title:                             Title:
Date:                              Date:`;
  }

  if (type.includes("employ")) {
    const empType = answers.find((a) => a.question.toLowerCase().includes("type of employment"))?.answer || "Full-time permanent";
    const notice = answers.find((a) => a.question.toLowerCase().includes("notice"))?.answer || "1 month";
    const probation = answers.find((a) => a.question.toLowerCase().includes("probation"))?.answer || "Yes — 3 months";
    const benefits = answers.find((a) => a.question.toLowerCase().includes("benefits"))?.answer || "Standard statutory benefits only";
    const working = answers.find((a) => a.question.toLowerCase().includes("working"))?.answer || "Hybrid (flexible)";

    return `EMPLOYMENT CONTRACT

Date: ${today}
Jurisdiction: ${jurisdiction}

BETWEEN:

Employer: [EMPLOYER NAME]
Company Number: [COMPANY NUMBER]
Registered Address: [EMPLOYER ADDRESS]
("the Employer")

AND

Employee: [EMPLOYEE NAME]
Address: [EMPLOYEE ADDRESS]
("the Employee")

1. COMMENCEMENT AND JOB TITLE

1.1 The Employee's employment shall commence on [START DATE].

1.2 The Employee is employed as [JOB TITLE] reporting to [MANAGER NAME/TITLE].

1.3 Employment type: ${empType}.

2. PLACE OF WORK

2.1 Working arrangement: ${working}.

2.2 The Employee's primary place of work shall be [WORK LOCATION / HOME ADDRESS as applicable].

3. PROBATIONARY PERIOD

${probation.includes("No") ? "3.1 There is no probationary period. The terms of this contract apply from the commencement date." : `3.1 The Employee shall serve a probationary period of ${probation.includes("6") ? "six (6)" : "three (3)"} months.

3.2 During the probationary period, either party may terminate this contract with one week's written notice.

3.3 The Employer may extend the probationary period by a further ${probation.includes("6") ? "three (3)" : "three (3)"} months where performance has not met the required standard.`}

4. REMUNERATION

4.1 The Employee shall receive an annual salary of £[SALARY] gross, payable monthly in arrears on or before the last working day of each calendar month.

4.2 The salary shall be subject to deductions for income tax, National Insurance, and any other statutory deductions.

5. BENEFITS

${benefits.includes("Pension") || benefits.includes("Standard") ? `5.1 The Employee shall be enrolled in the Employer's workplace pension scheme in accordance with auto-enrolment legislation.` : ""}

${benefits.includes("Stock") || benefits.includes("equity") ? `5.2 The Employee may be eligible for the Employer's share option scheme, subject to the terms of the scheme and Board approval.` : ""}

${benefits.includes("bonus") || benefits.includes("Performance") ? `5.3 The Employee may be eligible for a discretionary performance bonus, subject to individual and company performance criteria.` : ""}

5.${benefits.includes("Standard") ? "2" : "4"} The Employee shall be entitled to [NUMBER] days paid annual leave per year, in addition to public holidays.

6. HOURS OF WORK

6.1 The Employee's normal working hours shall be [HOURS] per week, [SCHEDULE e.g., Monday to Friday, 9:00 AM to 5:30 PM].

6.2 The Employee may be required to work reasonable additional hours as necessary for the proper performance of their duties.

7. NOTICE PERIOD

7.1 After completion of the probationary period, either party may terminate this contract by giving ${notice} written notice.

7.2 The Employer reserves the right to make a payment in lieu of notice.

8. CONFIDENTIALITY

8.1 The Employee shall not, during or after employment, disclose any Confidential Information belonging to the Employer.

8.2 "Confidential Information" includes trade secrets, client lists, financial information, business strategies, and any information not in the public domain.

9. INTELLECTUAL PROPERTY

9.1 All intellectual property created by the Employee in the course of employment shall belong to the Employer.

9.2 The Employee hereby assigns all rights, title, and interest in any work product to the Employer.

10. GOVERNING LAW

10.1 This contract shall be governed by and construed in accordance with the laws of ${jurisdiction}.

IN WITNESS WHEREOF, the parties have executed this contract as of the date first written above.

_________________________          _________________________
For and on behalf of Employer      Employee
Name:                              Name:
Title:
Date:                              Date:`;
  }

  if (type.includes("service") || type.includes("consulting")) {
    const serviceType = answers.find((a) => a.question.toLowerCase().includes("type of service"))?.answer || "Professional/consulting services";
    const payment = answers.find((a) => a.question.toLowerCase().includes("compensated"))?.answer || "Fixed project fee";
    const payTerms = answers.find((a) => a.question.toLowerCase().includes("payment terms"))?.answer || "Net 30 days";
    const ip = answers.find((a) => a.question.toLowerCase().includes("intellectual property") || a.question.toLowerCase().includes("owns"))?.answer || "Client owns all IP";
    const termination = answers.find((a) => a.question.toLowerCase().includes("termination"))?.answer || "Either party with 30 days notice";

    return `SERVICE AGREEMENT

Date: ${today}
Jurisdiction: ${jurisdiction}

BETWEEN:

Client: [CLIENT NAME]
Address: [CLIENT ADDRESS]
("the Client")

AND

Service Provider: [SERVICE PROVIDER NAME]
Address: [SERVICE PROVIDER ADDRESS]
("the Service Provider")

1. SCOPE OF SERVICES

1.1 The Service Provider agrees to provide the following services to the Client:

    Service Type: ${serviceType}

    [DETAILED DESCRIPTION OF SERVICES]

1.2 The Service Provider shall perform the Services with reasonable skill, care, and diligence in accordance with industry standards.

1.3 The Service Provider shall comply with all applicable laws and regulations in the performance of the Services.

2. TERM

2.1 This Agreement shall commence on [START DATE] and shall continue until [END DATE / completion of the Services].

2.2 Termination: ${termination}.

3. FEES AND PAYMENT

3.1 Payment structure: ${payment}.

3.2 The total fee for the Services shall be £[AMOUNT] [plus applicable VAT].

3.3 Payment terms: ${payTerms}.

3.4 The Service Provider shall submit invoices to the Client at [INVOICING FREQUENCY].

3.5 Late payments shall accrue interest at the rate of [RATE]% per annum above the base rate.

4. INTELLECTUAL PROPERTY

4.1 ${ip.includes("Client owns") ? "All intellectual property rights in the deliverables and work product shall vest in the Client upon creation and full payment." : ip.includes("retains") ? "The Service Provider retains all intellectual property rights in the work product. The Client is granted a perpetual, non-exclusive license to use the deliverables for their business purposes." : ip.includes("Joint") ? "Intellectual property created under this Agreement shall be jointly owned by both parties." : "All intellectual property rights shall transfer to the Client upon full payment of all fees."}

4.2 The Service Provider warrants that the deliverables will not infringe any third-party intellectual property rights.

5. CONFIDENTIALITY

5.1 Each party agrees to keep confidential all information received from the other party that is designated as confidential or that reasonably should be understood to be confidential.

5.2 This obligation shall survive the termination of this Agreement for a period of two (2) years.

6. LIABILITY

6.1 The Service Provider's total aggregate liability under this Agreement shall not exceed [the total fees paid / £AMOUNT].

6.2 Neither party shall be liable for any indirect, consequential, or special damages.

6.3 Nothing in this Agreement shall exclude or limit liability for fraud, death, or personal injury caused by negligence.

7. WARRANTIES

7.1 The Service Provider warrants that:
    (a) The Services will be performed with reasonable skill and care;
    (b) The Services will conform to the specifications agreed in writing;
    (c) The Service Provider has the right and authority to enter into this Agreement.

8. GOVERNING LAW

8.1 This Agreement shall be governed by and construed in accordance with the laws of ${jurisdiction}.

8.2 Any disputes shall be submitted to the exclusive jurisdiction of the courts of ${jurisdiction}.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

_________________________          _________________________
Client                             Service Provider
Name:                              Name:
Title:                             Title:
Date:                              Date:`;
  }

  // Generic fallback for any other document type
  const duration = answers.find((a) => a.question.toLowerCase().includes("duration"))?.answer || "Ongoing until terminated";
  const parties = answers.find((a) => a.question.toLowerCase().includes("parties"))?.answer || "Two companies";
  const confidentiality = answers.find((a) => a.question.toLowerCase().includes("confidentiality"))?.answer || "Yes — mutual";

  return `${docType.toUpperCase()}

Date: ${today}
Jurisdiction: ${jurisdiction}

BETWEEN:

Party A: [PARTY A NAME]
Address: [PARTY A ADDRESS]

AND

Party B: [PARTY B NAME]
Address: [PARTY B ADDRESS]

(${parties})

RECITALS

WHEREAS, the parties wish to enter into this ${docType} to establish the terms and conditions of their agreement.

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. PURPOSE AND SCOPE

1.1 This ${docType} sets forth the terms and conditions under which the parties agree to [DESCRIBE PURPOSE].

1.2 The scope of this agreement covers [DESCRIBE SCOPE].

2. TERM AND DURATION

2.1 This Agreement shall commence on [START DATE].

2.2 Duration: ${duration}.

2.3 Either party may terminate this Agreement by providing written notice in accordance with the termination provisions below.

3. OBLIGATIONS OF PARTY A

3.1 Party A shall:
    (a) [OBLIGATION 1]
    (b) [OBLIGATION 2]
    (c) [OBLIGATION 3]

4. OBLIGATIONS OF PARTY B

4.1 Party B shall:
    (a) [OBLIGATION 1]
    (b) [OBLIGATION 2]
    (c) [OBLIGATION 3]

5. PAYMENT TERMS

5.1 [PAYMENT STRUCTURE AND AMOUNTS]

5.2 Payment shall be made within [PAYMENT TERMS] of receipt of invoice.

5.3 All amounts are exclusive of VAT unless otherwise stated.

6. CONFIDENTIALITY

${confidentiality.includes("No") ? "6.1 No confidentiality obligations apply under this Agreement." : `6.1 ${confidentiality.includes("mutual") ? "Each party" : "The receiving party"} agrees to keep confidential all information received from ${confidentiality.includes("mutual") ? "the other party" : "the disclosing party"} that is designated as confidential.

6.2 This obligation shall survive the termination of this Agreement for a period of two (2) years.`}

7. LIABILITY

7.1 Neither party shall be liable for any indirect, consequential, or special damages arising out of this Agreement.

7.2 The total liability of either party under this Agreement shall not exceed [AMOUNT / value of the Agreement].

8. TERMINATION

8.1 Either party may terminate this Agreement by giving [NOTICE PERIOD] written notice to the other party.

8.2 Either party may terminate immediately if the other party commits a material breach that remains unremedied for [14/30] days after written notice.

9. DISPUTE RESOLUTION

9.1 The parties shall attempt to resolve any disputes through good faith negotiation.

9.2 If negotiation fails, disputes shall be referred to [mediation/arbitration/the courts of ${jurisdiction}].

10. GENERAL PROVISIONS

10.1 Governing Law. This Agreement shall be governed by the laws of ${jurisdiction}.

10.2 Entire Agreement. This Agreement constitutes the entire agreement between the parties.

10.3 Amendment. This Agreement may only be amended in writing signed by both parties.

10.4 Severability. If any provision is held invalid, the remaining provisions shall continue in full force.

10.5 No Waiver. Failure to exercise any right shall not constitute a waiver.

10.6 Assignment. Neither party may assign this Agreement without the prior written consent of the other party.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

_________________________          _________________________
Party A                            Party B
Name:                              Name:
Title:                             Title:
Date:                              Date:`;
}

export async function POST(req: NextRequest) {
  try {
    const body: DocumentRequest = await req.json();
    const { documentType, answers } = body;

    const document = generateDocument(documentType, answers);

    return NextResponse.json({ document });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
