import { Logo } from "@/components/layout/logo";

// Layout for /sign-in and /sign-up: no sidebar, the form centered on the page
export default function AuthLayout({ children }: LayoutProps<"/">) {
    return (
        <main className="flex min-h-dvh items-center justify-center px-4 py-8">
            <div className="flex w-full max-w-md flex-col gap-4">
                <header className="mb-4 flex flex-col gap-2">
                    <Logo size="large" />
                    <p className="text-muted">
                        The social app for tennis players and tennis clubs
                    </p>
                </header>
                {children}
            </div>
        </main>
    );
}
