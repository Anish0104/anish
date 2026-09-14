# Proof documents

Supporting evidence for certifications and leadership roles.

```
public/documents/certifications/   certificate PDFs or images
public/documents/leadership/       appointment and recognition letters
```

## How they are wired

Each entry in `data/skills.ts` (certifications) or `data/experience.ts`
(leadership) carries a `documents` array of `SupportingDocument`:

```ts
{ label: "View certificate", href: "/documents/certifications/x.pdf", kind: "pdf" }
{ label: "View appointment letter", href: "/documents/leadership/y.pdf", kind: "pdf" }
{ label: "Verify credential", href: "https://issuer/verify/123", kind: "link" }
```

Local paths are existence-checked on the server by `lib/documents.ts`. A data
entry whose file is not committed simply renders no button, so nothing ever
points at a 404. Add the file and the entry in whichever order suits you.

## Still waiting on files

| Entry | Expected filename | What the document should be |
| --- | --- | --- |
| President, IEI-TCET (Aug 2023 to Aug 2024) | `leadership/iei-tcet-president-appointment-2023.pdf` | TCET Office Order Sr.No/Principal/302 of 2023, dated 11 August 2023, appointing Anish Shirodkar President of IEI-TCET for AY 2023-24, signed by Dr. B. K. Mishra, Principal. The data entry for this is already written and will light up as soon as the file lands here. |

No certificate files have been supplied yet. The two Skilljar credentials and
the AWS Educate badge already link to their issuer verification pages, which
were checked by hand and resolve.

Entries with no document and no verification URL currently show nothing, which
is deliberate: there is no "proof coming soon" placeholder.

## Naming

Use lowercase, hyphenated, descriptive names that say what the document is and
when it was issued, for example:

```
certifications/huggingface-llm-fundamentals-2026.pdf
leadership/iei-tcet-president-appointment-2023.pdf
```
