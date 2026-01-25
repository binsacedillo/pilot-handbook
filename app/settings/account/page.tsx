'use client';

import { UserProfile } from "@clerk/nextjs";

export default function AccountSettingsPage() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Account Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your profile, email, password, and security settings
        </p>
      </div>
      <div className="w-full overflow-x-auto">
        <UserProfile
          routing="hash"
          appearance={{
            variables: {
              colorPrimary: "var(--primary)",
              colorBackground: "var(--card)",
              colorText: "var(--foreground)",
              colorTextSecondary: "var(--muted-foreground)",
              colorInputBackground: "var(--background)",
              colorInputText: "var(--foreground)",
              borderRadius: "0.625rem",
            },
            elements: {
              rootBox: "w-full",
              card: "shadow-none border border-border bg-card text-foreground w-full",
              navbar: "hidden sm:flex",
              pageScrollBox: "w-full",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              profileSectionTitleText: "text-foreground",
              profileSectionPrimaryButton: "bg-primary text-primary-foreground hover:bg-primary/90",
              formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
              formFieldInput: "bg-background text-foreground border border-border",
            },
            layout: {
              socialButtonsPlacement: "bottom",
              socialButtonsVariant: "iconButton",
            },
          }}
        />
      </div>
    </div>
  );
}
