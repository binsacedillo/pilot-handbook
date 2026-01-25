import Link from "next/link";
import Plane from "lucide-react/dist/esm/icons/plane";

export default function AppFooter() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="bg-card border-t border-border mt-auto">
			<div className="max-w-7xl mx-auto px-4 py-6 text-muted-foreground">
				{/* Main Footer Content */}
				<div className="flex flex-col md:flex-row justify-between items-center gap-4">
					{/* Brand */}
					<div className="flex items-center gap-2 text-foreground">
						<Plane className="w-4 h-4 text-primary" />
						<span className="text-sm font-semibold">Pilot Handbook</span>
					</div>

					{/* Links */}
					<div className="flex flex-wrap items-center justify-center gap-6 text-sm">
						<Link href="/about" className="hover:text-foreground transition-colors">
							About
						</Link>
						<Link href="/terms" className="hover:text-foreground transition-colors">
							Terms of Service
						</Link>
						<Link href="/privacy" className="hover:text-foreground transition-colors">
							Privacy Policy
						</Link>
						<Link href="/contact" className="hover:text-foreground transition-colors">
							Contact
						</Link>
						<Link href="/help" className="hover:text-foreground transition-colors">
							Help Center
						</Link>
					</div>

					{/* Copyright */}
					<div className="text-sm">© {currentYear} All rights reserved</div>
				</div>
			</div>
		</footer>
	);
}
