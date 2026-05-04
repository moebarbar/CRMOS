import Link from 'next/link';
import { Icon } from '@/components/brand/Icon';
import { Logo } from '@/components/brand/Logo';
import { MoeDemo } from '@/components/marketing/MoeDemo';

export default function MarketingHome() {
  return (
    <>
      <div className="announce-bar">
        <span className="ann-pill mono">NEW</span>
        Moe v2 ships with voice-to-action — <a href="#changelog">read the notes →</a>
      </div>
      <header className="nav">
        <div className="nav-inner">
          <Link href="/" aria-label="CRMOS home">
            <Logo size={26} />
          </Link>
          <nav className="nav-links">
            <a href="#product">Product</a>
            <a href="#pricing">Pricing</a>
            <a href="#agencies">For Agencies</a>
            <a href="#customers">Customers</a>
            <a href="#changelog">Changelog</a>
          </nav>
          <div className="nav-cta">
            <Link href="/sign-in" className="btn ghost">
              Log in
            </Link>
            <Link href="/onboarding" className="btn">
              Demo dashboard
            </Link>
            <Link href="/sign-up" className="btn primary">
              Start free
            </Link>
          </div>
        </div>
      </header>

      <main>
        <div className="hero hero-split-wrap">
          <div className="hero hero-split">
            <div className="hero-left">
              <div className="hero-eyebrow">
                <span className="pulse-dot" />
                <span>NEW · Moe v2 · voice-to-action</span>
              </div>
              <h1 className="hero-title" style={{ marginTop: 24 }}>
                Run your whole
                <br />
                business. <span className="highlight">Or tell Moe.</span>
              </h1>
              <p className="hero-sub">
                CRMOS is one app where leads, proposals, contracts, invoices, projects, scheduling,
                time, and client comms live together — and an AI agent named Moe takes voice or text
                commands and just does the work.
              </p>
              <div className="hero-cta">
                <Link href="/sign-up" className="btn primary lg">
                  Start free <Icon name="arrow" size={16} />
                </Link>
                <a href="#product" className="btn lg ghost">
                  Watch the demo <Icon name="play" size={14} />
                </a>
              </div>
              <div className="hero-meta mono">
                <span>
                  <Icon name="check" size={13} /> 14-day trial
                </span>
                <span>
                  <Icon name="check" size={13} /> No card
                </span>
                <span>
                  <Icon name="check" size={13} /> Replaces 8–12 tools
                </span>
              </div>
            </div>
            <div className="hero-right">
              <MoeDemo />
            </div>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-num">
                <span className="lime-text">2,400+</span>
              </div>
              <div className="hero-stat-label">teams shipped</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">$84M</div>
              <div className="hero-stat-label">invoiced via Moe</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">11.4 hrs</div>
              <div className="hero-stat-label">saved per week, avg.</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">4.9 ★</div>
              <div className="hero-stat-label">G2 · 312 reviews</div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
