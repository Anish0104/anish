/**
 * Runs before first paint so the correct theme class is on <html> by the
 * time anything renders. Light is the default when nothing is stored.
 */
const script = `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"){document.documentElement.classList.add("dark")}}catch(e){}})();`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
