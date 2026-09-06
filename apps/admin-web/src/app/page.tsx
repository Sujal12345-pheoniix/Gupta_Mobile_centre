import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to dashboard (which will show login if not authenticated)
  redirect('/dashboard');
}