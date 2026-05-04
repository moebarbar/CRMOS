import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="bg-muted/30 flex min-h-screen items-center justify-center px-4 py-12">
      <SignUp appearance={{ elements: { card: 'shadow-lg' } }} />
    </div>
  );
}
