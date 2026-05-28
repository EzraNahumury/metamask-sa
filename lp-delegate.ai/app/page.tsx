import { CTA } from "./components/CTA";
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { Nav } from "./components/Nav";
import { OnchainProof } from "./components/OnchainProof";
import { SponsorStack } from "./components/SponsorStack";
import { WebGLBackground } from "./components/WebGLClient";

export default function Page() {
  return (
    <>
      <WebGLBackground />
      <Nav />
      <main className="relative z-10">
        <Hero />
        <Features />
        <HowItWorks />
        <OnchainProof />
        <SponsorStack />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
