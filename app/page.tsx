import Header from '@/components/Header';
import Hero from '@/components/Hero';
import StatsStrip from '@/components/StatsStrip';
import FlowCards from '@/components/FlowCards';
import HowItWorks from '@/components/HowItWorks';
import Footer from '@/components/Footer';

export default function Page() {
  return (
    <div className="min-h-screen bg-[#050508] p-3 md:p-5">
      <div className="relative overflow-hidden rounded-[28px] border border-border bg-bg">
        {/* Ambient corner glows (per mockup) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-44 right-[-120px] h-[480px] w-[480px] rounded-full opacity-25 blur-[120px]"
          style={{ background: '#9945FF' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-160px] left-[-120px] h-[420px] w-[420px] rounded-full opacity-[0.13] blur-[120px]"
          style={{ background: '#14F195' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-120px] right-[-80px] h-[380px] w-[380px] rounded-full opacity-10 blur-[110px]"
          style={{ background: '#14F195' }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[-100px] top-[46%] h-[380px] w-[380px] rounded-full opacity-[0.10] blur-[110px]"
          style={{ background: '#9945FF' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-100px] top-[52%] h-[380px] w-[380px] rounded-full opacity-[0.09] blur-[110px]"
          style={{ background: '#14F195' }}
        />

        <div className="relative z-10 mx-auto max-w-[1280px] px-5 md:px-10 lg:px-20">
          <Header />
          <main>
            <Hero />
            <StatsStrip />
            <FlowCards />
            <HowItWorks />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
