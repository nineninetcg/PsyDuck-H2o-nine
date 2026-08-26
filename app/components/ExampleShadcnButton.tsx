import {Button} from '@/components/ui/button';

/**
 * Example component showing how to use shadcn/ui components
 * 
 * Usage in your routes:
 * import { ExampleShadcnButton } from '@/components/ExampleShadcnButton';
 */
export function ExampleShadcnButton() {
  return (
    <div className="flex gap-4 p-4">
      <Button variant="default">Default Button</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  );
}
