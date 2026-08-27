import { hasAuthenticatedSession } from "@/actions/auth";
import { LandingPage } from "@/components/landing/LandingPage";

export default async function HomePage() {
  const signedIn = await hasAuthenticatedSession();
  return <LandingPage signedIn={signedIn} />;
}
