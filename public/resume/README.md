# Resume PDF

Drop the PDF in this folder as:

    public/resume/anish-shirodkar-resume.pdf

Then open `data/profile.ts` and set:

```ts
export const resume = {
  available: true,
  path: "/resume/anish-shirodkar-resume.pdf",
} as const;
```

`/resume` will switch from the "coming soon" state to a real download link.
Nothing else needs changing. The flag is the only switch.
