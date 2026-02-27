import { features } from "@/lib/landing-data";
import FeatureCard from "./FeatureCard";
import FadeIn from "./FadeIn";

export default function Features() {
	return (
		<section className="relative bg-white dark:bg-background py-16 sm:py-24 overflow-hidden isolate">
			{/* Technical Dot Pattern Background */}
			<div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

			<div className="container mx-auto px-4">
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
						{features.map((feature, index) => (
							<FadeIn key={feature.title} delay={index * 100}>
								<FeatureCard
									icon={feature.icon}
									title={feature.title}
									description={feature.description}
								/>
							</FadeIn>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
