import { AuthTabs } from "@/features/auth/components/auth-tabs";

// Layout for /sign-in and /sign-up: no sidebar, the form centered on the page
export default function AuthLayout({ children }: LayoutProps<"/">) {
    return (
        <main className="flex min-h-dvh items-center justify-center px-4 py-8">
            <div className="flex w-full max-w-md flex-col gap-4">
                <AuthTabs />
                {children}
            </div>
        </main>
    );
}
