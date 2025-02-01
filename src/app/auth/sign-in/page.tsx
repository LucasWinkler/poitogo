import { Suspense } from "react";
import { SignInForm } from "@/components/auth/SignInForm";
import AuthLoading from "../loading";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Sign In",
  description:
    "Sign in to your PoiToGo account to access your saved places and lists.",
});

const SignInPage = () => {
  return (
    <Suspense fallback={<AuthLoading />}>
      <SignInForm />
    </Suspense>
  );
};

export default SignInPage;
