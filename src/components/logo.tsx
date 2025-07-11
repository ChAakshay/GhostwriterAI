import { Feather } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Feather className="h-8 w-8 text-primary" />
      <span className="text-2xl font-bold font-headline text-primary">
        Ghostwriter AI
      </span>
    </div>
  );
}
