import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
	icon: LucideIcon;
	title: string;
	description: string;
}

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
	return (
		<div className="h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
			<div className="w-14 h-14 rounded-lg bg-linear-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-4">
				<Icon className="w-7 h-7 text-blue-700" />
			</div>
			<h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
			<p className="text-slate-600 text-sm leading-relaxed">{description}</p>
		</div>
	);
}
