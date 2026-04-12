import {
	Clock,
	BookOpen,
	TrendingUp,
	BarChart3,
	Plane,
	Shield,
	UserPlus,
	ClipboardList,
	LucideIcon,
} from "lucide-react";

export interface Feature {
	icon: LucideIcon;
	title: string;
	description: string;
}

export const features: Feature[] = [
	{
		icon: Clock,
		title: "Precise Flight Logging",
		description: "Log every flight with departure/arrival codes, duration, landings, and remarks. Track PIC and dual instruction time separately.",
	},
	{
		icon: BookOpen,
		title: "Aircraft Fleet Management",
		description: "Maintain detailed records of all aircraft you've flown. Track make, model, registration, and operational status.",
	},
	{
		icon: BarChart3,
		title: "Advanced Analytics",
		description: "Visualize your progress with interactive charts. View hours by aircraft type, monthly trends, and comprehensive flight statistics.",
	},
	{
		icon: Plane,
		title: "Cloud-Based Storage",
		description: "Access your logbook from any device. Your data is securely stored in the cloud and automatically synced.",
	},
	{
		icon: Shield,
		title: "Secure & Private",
		description: "Role-based access control and authentication powered by Clerk. Your flight data is protected and isolated per user.",
	},
	{
		icon: TrendingUp,
		title: "Real-Time Statistics",
		description: "Track total hours, average flight duration, and recent activity. Monitor your flight currency with 90-day recency calculations.",
	},
];

export interface Step {
	number: number;
	title: string;
	description: string;
	icon: LucideIcon;
}

export const steps: Step[] = [
	{
		number: 1,
		title: "Create Your Account",
		description: "Sign up in seconds with your email. No complex setup required.",
		icon: UserPlus,
	},
	{
		number: 2,
		title: "Add Your Aircraft",
		description: "Set up your aircraft fleet with make, model, and registration details.",
		icon: Plane,
	},
	{
		number: 3,
		title: "Log Your Flights",
		description: "Start recording your flight hours and watch your career progress.",
		icon: ClipboardList,
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
		title: "Company",
		links: [
			{ label: "About", href: "/about" },
			{ label: "Blog", href: "/blog" },
			{ label: "Contact", href: "/contact" },
		],
	},
	{
		title: "Product",
		links: [
			{ label: "Features", href: "/#features" },
			{ label: "FAQ", href: "/#faq" },
		],
	},
	{
		title: "Legal",
		links: [
			{ label: "Privacy", href: "/privacy" },
			{ label: "Terms", href: "/terms" },
			{ label: "Security", href: "/privacy" },
		],
	},
];

