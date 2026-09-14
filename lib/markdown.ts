import "server-only";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import type { Schema } from "hast-util-sanitize";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Element, Root } from "hast";

/**
 * README rendering.
 *
 * README markdown is untrusted input from a third-party host, so the pipeline
 * is deliberately strict:
 *
 *  - raw HTML is parsed (so text inside <div> wrappers survives) and then run
 *    through rehype-sanitize, which strips scripts, iframes, event handlers,
 *    and anything not on the allow-list below;
 *  - `javascript:` and other non-http(s) URLs are dropped by the schema's
 *    protocol rules;
 *  - no MDX, no code execution, no diagram rendering: mermaid and friends
 *    stay as readable code blocks.
 */

/** Only these hosts may be referenced by <img> inside a rendered README. */
const ALLOWED_IMAGE_HOSTS = new Set([
  "raw.githubusercontent.com",
  "github.com",
  "user-images.githubusercontent.com",
  "camo.githubusercontent.com",
  "img.shields.io",
  "colab.research.google.com",
]);

const schema: Schema = {
  ...defaultSchema,
  protocols: {
    ...defaultSchema.protocols,
    href: ["http", "https", "mailto"],
    src: ["http", "https"],
  },
  tagNames: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr", "blockquote",
    "ul", "ol", "li",
    "strong", "em", "del", "code", "pre",
    "a", "img",
    "table", "thead", "tbody", "tr", "th", "td",
    "div", "span", "details", "summary", "sup", "sub", "kbd",
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: ["href", "title"],
    img: ["src", "alt", "title", "width", "height"],
    code: [["className", /^language-./]],
    div: [],
    span: [],
    th: ["align"],
    td: ["align"],
  },
};

type RepoRef = { owner: string; repo: string; branch: string; dir: string };

/**
 * Rewrites relative links and images so they resolve against the right repo,
 * branch, and README directory. Images go to raw.githubusercontent.com, links
 * to the GitHub blob view. In-page anchors (#section) are left alone.
 */
function rehypeResolveRelative(ref: RepoRef) {
  const { owner, repo, branch, dir } = ref;
  const base = dir ? `${dir.replace(/\/+$/, "")}/` : "";
  const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${base}`;
  const blobBase = `https://github.com/${owner}/${repo}/blob/${branch}/${base}`;

  const isAbsolute = (v: string) => /^[a-z][a-z0-9+.-]*:/i.test(v) || v.startsWith("//");

  return () => (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      const props = node.properties ?? {};

      if (node.tagName === "a" && typeof props.href === "string") {
        const href = props.href;
        if (!href.startsWith("#") && !isAbsolute(href)) {
          props.href = blobBase + href.replace(/^\.\//, "").replace(/^\//, "");
        }
        // Everything leaves the site, so make that safe and explicit.
        if (typeof props.href === "string" && /^https?:/i.test(props.href)) {
          props.target = "_blank";
          props.rel = ["noreferrer", "noopener", "nofollow"];
        }
      }

      if (node.tagName === "img" && typeof props.src === "string") {
        const src = props.src;
        if (!isAbsolute(src)) {
          props.src = rawBase + src.replace(/^\.\//, "").replace(/^\//, "");
        }
        // Drop remote images from hosts we did not configure.
        try {
          const host = new URL(props.src as string).hostname;
          if (!ALLOWED_IMAGE_HOSTS.has(host)) {
            node.tagName = "span";
            node.properties = {};
            node.children = [
              { type: "text", value: (props.alt as string) || "[image]" },
            ];
          }
        } catch {
          node.tagName = "span";
          node.properties = {};
          node.children = [];
        }
      }
      node.properties = props;
    });
  };
}

/** Wraps tables so wide ones scroll inside the dialog instead of widening it. */
function rehypeWrapTables() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "table" || !parent || index === undefined) return;
      const p = parent as unknown as Element;
      if (p.tagName === "div" && (p.properties?.className as string[])?.includes("table-scroll")) {
        return;
      }
      (parent.children as unknown[])[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["table-scroll"] },
        children: [node],
      };
    });
  };
}


/**
 * Strips em dashes from README *prose* only.
 *
 * Code blocks, inline code, and URL-looking link text are left exactly as the
 * author wrote them, and the cached snapshot on disk is never modified: this
 * only affects the HTML rendered into the dialog.
 */
function deEmDash(value: string): string {
  return value
    .replace(/\s*\u2014\s*/g, (_match, offset: number) =>
      offset === 0 ? "" : ", "
    )
    .replace(/,\s*,/g, ",")
    .replace(/\s+,/g, ",");
}

const looksLikeUrl = (value: string) =>
  /^\s*(https?:\/\/|www\.)\S+\s*$/i.test(value);

function rehypeProseEmDashes() {
  return (tree: Root) => {
    const skip = new Set(["code", "pre"]);
    visit(tree, "text", (node: { value: string }, _index, parent) => {
      if (!node.value.includes("\u2014")) return;
      const tag = (parent as Element | undefined)?.tagName;
      if (tag && skip.has(tag)) return;
      if (tag === "a" && looksLikeUrl(node.value)) return;
      node.value = deEmDash(node.value);
    });
  };
}

export async function renderMarkdown(
  markdown: string,
  ref: RepoRef
): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    // Strips the YAML front matter some READMEs carry (e.g. HF Spaces config).
    .use(remarkFrontmatter, ["yaml", "toml"])
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeResolveRelative(ref))
    .use(rehypeSanitize, schema)
    .use(rehypeWrapTables)
    .use(rehypeProseEmDashes)
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}
