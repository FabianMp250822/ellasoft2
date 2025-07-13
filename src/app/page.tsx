import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, GraduationCap, School, User } from 'lucide-react';
import { Icons } from '@/components/icons';

export default function LoginPage() {
  const roles = [
    {
      name: 'Superadmin',
      description: 'Manage all organizations',
      icon: <Briefcase className="h-8 w-8 text-primary" />,
      href: '/superadmin/dashboard',
    },
    {
      name: 'Admin',
      description: 'Manage your institution',
      icon: <School className="h-8 w-8 text-primary" />,
      href: '/admin/dashboard',
    },
    {
      name: 'Teacher',
      description: 'Access your classes',
      icon: <GraduationCap className="h-8 w-8 text-primary" />,
      href: '/teacher/dashboard',
    },
    {
      name: 'Student',
      description: 'View your academic profile',
      icon: <User className="h-8 w-8 text-primary" />,
      href: '/student/dashboard',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex flex-col items-center text-center">
        <Icons.logo className="h-16 w-16 mb-4 text-primary" />
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Welcome to EduAI
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your AI-Powered Academic Management System
        </p>
      </div>

      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Select Your Role</CardTitle>
          <CardDescription>Choose how you want to access the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {roles.map((role) => (
              <Button
                key={role.name}
                variant="outline"
                className="h-auto w-full justify-start p-6 text-left transition-all hover:shadow-md hover:bg-accent/50"
                asChild
              >
                <Link href={role.href}>
                  <div className="flex items-center gap-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                      {role.icon}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">{role.name}</p>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} EduAI. All rights reserved.</p>
        <p className="mt-1">A demonstration of a multi-tenant academic platform.</p>
      </footer>
    </div>
  );
}
