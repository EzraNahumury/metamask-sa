import { CTA } from "./components/CTA";
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { OnchainProof } from "./components/OnchainProof";
import { Sidebar } from "./components/Sidebar";
import { SponsorStack } from "./components/SponsorStack";
import { WebGLBackground } from "./components/WebGLClient";

export default function Page() {
  return (
    <>
      <WebGLBackground />
      <Sidebar />
      <div className="lg:ml-[var(--sidebar-width)] min-h-screen flex flex-col relative z-10">
        <Header />
        <main className="flex-1 px-4 sm:px-8 max-w-[var(--content-max)] mx-auto w-full">
          <Hero />
          <Features />
          <HowItWorks />
          <OnchainProof />
          <SponsorStack />
          <CTA />
          <Footer />
        </main>
      </div>
    </>
  );
}
