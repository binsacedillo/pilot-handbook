import { Clock, BookOpen, TrendingUp, Shield, Plane, CheckCircle, LucideIcon } from "lucide-react";

export interface Feature {
	icon: LucideIcon;
	title: string;
	description: string;
}

export const features: Feature[] = [
	{
		icon: Clock,
		title: "Accurate Time Tracking",
		description: "Log flight hours with precision. Track PIC, dual, cross-country, night, and instrument time automatically.",
	},
	{
		icon: BookOpen,
		title: "Aircraft Management",
		description: "Maintain detailed records of all aircraft you've flown. Track make, model, and registration numbers.",
	},
	{
		icon: TrendingUp,
		title: "Career Insights",
		description: "Visualize your progress with charts and reports. Track your journey towards certifications and ratings.",
	},
	{
		icon: Shield,
		title: "CAAP Compliant",
		description: "Meet all regulatory requirements with confidence. Export reports for checkrides and interviews.",
	},
	{
		icon: Plane,
		title: "Cloud Sync",
		description: "Access your logbook from anywhere. Your data is securely backed up and always available.",
	},
	{
		icon: CheckCircle,
		title: "Easy Import",
		description: "Migrate from paper or other digital logbooks seamlessly. Import your existing flight history.",
	},
];

export interface Step {
	number: number;
	title: string;
	description: string;
}

export const steps: Step[] = [
	{
		number: 1,
		title: "Create Your Account",
		description: "Sign up in seconds with your email. No complex setup required.",
	},
	{
		number: 2,
		title: "Add Your Aircraft",
		description: "Set up your aircraft fleet with make, model, and registration details.",
	},
	{
		number: 3,
		title: "Log Your Flights",
		description: "Start recording your flight hours and watch your career progress.",
	},
];

export interface FooterLink {
	label: string;
	href: string;
}

export interface FooterSection {
	title: string;
	links: FooterLink[];
}

export const footerSections: FooterSection[] = [
	{
		title: "Product",
		links: [
			{ label: "Features", href: "/sign-up" },
			{ label: "Pricing", href: "/sign-up" },
			{ label: "FAQ", href: "/sign-up" },
		],
	},
	{
		title: "Company",
		links: [
			{ label: "About", href: "/sign-up" },
			{ label: "Blog", href: "/sign-up" },
			{ label: "Contact", href: "/sign-up" },
		],
	},
	{
		title: "Legal",
		links: [
			{ label: "Privacy", href: "/sign-up" },
			{ label: "Terms", href: "/sign-up" },
			{ label: "Security", href: "/sign-up" },
		],
	},
];
