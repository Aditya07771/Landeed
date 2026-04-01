// app/page.tsx
import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import StatsTickerBar from '@/components/landing/StatsTickerBar'
import ProblemSolution from '@/components/landing/ProblemSolution'
import FeaturesSection from '@/components/landing/FeaturesSection'
import WorkflowSection from '@/components/landing/WorkflowSection'
import RolesSection from '@/components/landing/RolesSection'
import MapPreviewSection from '@/components/landing/MapPreviewSection'
import TechStackSection from '@/components/landing/TechStackSection'
import FAQSection from '@/components/landing/FAQSection'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/landing/Footer'
// import MapPreviewSection from '@/components/landing/MapPreviewSection'
// import TechStackSection from '@/components/landing/TechStackSection'
// import FAQSection from '@/components/landing/FAQSection'
// import CTASection from '@/components/landing/CTASection'
// import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen antialiased">
      <Navbar />
      <HeroSection />
      <StatsTickerBar />
      <ProblemSolution />
      <FeaturesSection />
      <WorkflowSection />
      <RolesSection />
      <MapPreviewSection />
      <TechStackSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  )
}