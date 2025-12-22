import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Plane, CheckCircle } from "lucide-react";

export default async function SignUpPage() {
	const { userId } = await auth();

	// Skip rendering sign-up when already signed in to avoid the single-session modal warning
	if (userId) redirect("/");

	return (
		<div className="flex min-h-screen">
			{/* Left Side - Branding */}
			<div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-indigo-600 via-purple-700 to-blue-800 p-12 flex-col justify-between relative overflow-hidden">
				<div className="absolute inset-0 opacity-10">
					<div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
					<div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
				</div>

				<div className="relative z-10">
					<div className="flex items-center gap-3 mb-8">
						<div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
							<Plane className="w-8 h-8 text-white" />
						</div>
						<span className="text-3xl font-bold text-white">Pilot Logbook</span>
					</div>

					<div className="mt-20">
						<h1 className="text-5xl font-bold text-white mb-6 leading-tight">
							Start Your
							<br />
							Journey Today
						</h1>
						<p className="text-xl text-purple-100 max-w-md mb-8">
							Join thousands of pilots tracking their flight hours and building
							their aviation career.
						</p>

						<div className="space-y-4">
							<div className="flex items-center gap-3 text-white">
							<CheckCircle className="w-6 h-6 shrink-0" />
								<span className="text-lg">Track unlimited flights</span>
							</div>
							<div className="flex items-center gap-3 text-white">
							<CheckCircle className="w-6 h-6 shrink-0" />
								<span className="text-lg">Manage multiple aircraft</span>
							</div>
							<div className="flex items-center gap-3 text-white">
							<CheckCircle className="w-6 h-6 shrink-0" />
								<span className="text-lg">Generate professional reports</span>
							</div>
							<div className="flex items-center gap-3 text-white">
							<CheckCircle className="w-6 h-6 shrink-0" />
								<span className="text-lg">Cloud sync across devices</span>
							</div>
						</div>
					</div>
				</div>

				<div className="relative z-10">
					<p className="text-purple-200 text-sm">
						&ldquo;This logbook has transformed how I track my hours. It&rsquo;s intuitive,
						reliable, and exactly what I needed.&rdquo;
					</p>
					<p className="text-white font-semibold mt-2">
						— Sarah Chen, Commercial Pilot
					</p>
				</div>
			</div>

			{/* Right Side - Sign Up Form */}
			<div className="flex-1 flex items-center justify-center p-8 bg-zinc-50">
				<div className="w-full max-w-md">
					<div className="lg:hidden mb-8 text-center">
						<div className="flex items-center justify-center gap-2 mb-4">
							<Plane className="w-6 h-6 text-indigo-600" />
							<span className="text-2xl font-bold text-gray-900">
								Pilot Logbook
							</span>
						</div>
						<p className="text-gray-600">Start tracking your flight hours</p>
					</div>

					<SignUp
						routing="hash"
						appearance={{
							elements: {
								rootBox: "w-full",
								card: "shadow-xl border-0",
							},
						}}
					/>
				</div>
			</div>
		</div>
	);
}
