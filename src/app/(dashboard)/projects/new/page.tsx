import { redirect } from 'next/navigation';

/**
 * Bypassing duplicate route group to resolve Netlify build conflict.
 * The primary project creation page is located at /src/app/dashboard/projects/new/page.tsx
 */
export default function NewProjectRedirect() {
  redirect('/dashboard/projects/new');
}
