export type EssayStatus = "planned";

export type Essay = {
  number: string;
  title: string;
  blurb: string;
  tags: string[];
  /**
   * Every entry here is an idea, not a published piece. There are no dates
   * and no hrefs on purpose, so nothing links anywhere until something is
   * actually written.
   */
  status: EssayStatus;
};

/**
 * Retained for later. Nothing on the site renders these: the essay list was
 * removed from /misc, and there is no component consuming this file.
 */
export const essays: Essay[] = [
  {
    number: "01",
    title: "What reranking actually changes",
    blurb: "Exploring how and why reranking helps (and when it doesn’t).",
    tags: ["retrieval", "evaluation"],
    status: "planned",
  },
  {
    number: "02",
    title: "Turning patient histories into tokens",
    blurb: "Notes on structuring clinical data for language models.",
    tags: ["research", "transformers"],
    status: "planned",
  },
];
