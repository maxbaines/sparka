import Link from 'next/link';
import type { Metadata } from 'next';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { SignupForm } from '@/components/signup-form';

export const metadata: Metadata = {
  title: 'Create an account',
  description: 'Create an account to get started.',
};

export default function RegisterPage() {
  return (
    <div className="container flex h-dvh w-screen flex-col items-center justify-center px-4 m-auto">
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute right-4 top-4 md:right-8 md:top-8',
        )}
      >
        Login
      </Link>
      <div className="mx-auto w-full sm:w-[480px] ">
        <SignupForm />
      </div>
    </div>
  );
}
