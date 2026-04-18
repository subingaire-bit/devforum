// Licensed under MIT - DevForum Project
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DevForum. Open-source under{" "}
            <Link
              href="https://opensource.org/licenses/MIT"
              target="_blank"
              className="text-primary hover:underline"
            >
              MIT License
            </Link>
            .
          </div>
          <nav className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/guidelines" className="text-muted-foreground hover:text-foreground transition-colors">
              Guidelines
            </Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link
              href="https://github.com/yourorg/devforum"
              target="_blank"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}