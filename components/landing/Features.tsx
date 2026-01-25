import { features } from "@/lib/landing-data";
import FeatureCard from "./FeatureCard";

export default function Features() {
	return (
		<section className="container mx-auto px-4 py-16">
			<div className="max-w-6xl mx-auto">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
						Everything You Need in One Place
					</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Built by pilots, for pilots. Our platform helps you stay organized
						and compliant.
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
					{features.map((feature) => (
						<FeatureCard
							key={feature.title}
							icon={feature.icon}
							title={feature.title}
							description={feature.description}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
