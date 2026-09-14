import { profile } from "@/data/profile";
import CompanionSurface from "@/components/companion/CompanionSurface";

export default function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-border py-8 sm:mt-28">
      <CompanionSurface id="footer" kind="footer" height={78} offset={12} />
      <div className="flex flex-col gap-2 text-[14px] text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>{profile.footer.left}</p>
        <p className="font-mono text-[12px]">{profile.footer.right}</p>
      </div>
    </footer>
  );
}
