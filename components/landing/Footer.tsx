import Link from "next/link";
import Plane from "lucide-react/dist/esm/icons/plane";
import { footerSections } from "@/lib/landing-data";

export default function Footer() {
	return (
		<footer className="border-t border-border bg-card">
			<div className="container mx-auto px-4 py-8">
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
					<div>
						<div className="flex items-center gap-2 mb-3">
							<Plane className="w-5 h-5 text-blue-600" />
							<span className="font-semibold text-foreground">Pilot Handbook</span>
						</div>
						<p className="text-sm text-muted-foreground">
							The professional digital logbook for modern pilots.
						</p>
					</div>

					{footerSections.map((section) => (
						<div key={section.title}>
							<h4 className="font-semibold text-foreground mb-3">{section.title}</h4>
							<ul className="space-y-2 text-sm text-muted-foreground">
								{section.links.map((link) => (
									<li key={link.label}>
										<Link href={link.href} className="hover:text-blue-600">
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
					<p>
						&copy; {new Date().getFullYear()} Pilot Handbook. All rights
						reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
