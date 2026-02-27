import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
	icon: LucideIcon;
	title: string;
	description: string;
}

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
	return (
		<div className="h-full rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
			<div className="w-14 h-14 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
				<Icon className="w-7 h-7 text-blue-700 dark:text-blue-400" />
			</div>
			<h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
			<p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
		</div>
	);
}
