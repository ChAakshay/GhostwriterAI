import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.99,34.691,44,29.891,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  );

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <header className="p-4 flex justify-start items-center">
        <Logo />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">
            Unlock Your Authentic Voice with AI
          </h1>
          <p className="mt-4 text-lg text-foreground/80 max-w-xl mx-auto">
            Ghostwriter AI helps you create content that's genuinely yours. Upload your past work, and we'll learn your unique style to generate new ideas and drafts that sound just like you.
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg" className="font-headline">
              <Link href="/dashboard">
                <GoogleIcon className="mr-2" />
                Continue with Google
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <footer className="p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Ghostwriter AI. All rights reserved.
      </footer>
    </div>
  );
}
