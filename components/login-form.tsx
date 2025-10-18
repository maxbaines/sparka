'use client';

import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SocialAuthProviders } from '@/components/social-auth-providers';
import Link from 'next/link';

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Continue with a social provider</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <SocialAuthProviders />
            <div className="text-center text-sm">
              Don&apos;t have an account?{' '}
              <a href="/register" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our{' '}
        <Link href="/terms">Terms of Service</Link> and{' '}
        <Link href="/privacy">Privacy Policy</Link>.
      </div>
    </div>
  );
}
