import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
	icon: LucideIcon;
	title: string;
	description: string;
}

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
	return (
		<div className="bg-white rounded-lg p-6 border border-slate-200 hover:border-blue-300 transition-colors">
			<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
				<Icon className="w-5 h-5 text-blue-600" />
			</div>
			<h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
			<p className="text-slate-600 text-sm">{description}</p>
		</div>
	);
}
