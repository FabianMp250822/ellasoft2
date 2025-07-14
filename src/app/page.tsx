import { LoginForm } from "@/components/login-form";
import { Icons } from "@/components/icons";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
       <div className="mb-8 flex flex-col items-center text-center">
        <Icons.logo className="h-16 w-16 mb-4 text-primary" />
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Welcome to EduAI
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your AI-Powered Academic Management System
        </p>
      </div>
      <LoginForm />
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} EduAI. All rights reserved.</p>
      </footer>
    </div>
  );
}
