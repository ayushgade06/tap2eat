import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, Zap, ShieldCheck, ChefHat, Heart,
  Smartphone, QrCode, UtensilsCrossed
} from "lucide-react";
import ThemeToggle from "../../components/ThemeToggle";
import BrandLogo from "../../components/BrandLogo";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }
  })
};

export default function LandingPage({ onOpenAuth }) {
  const containerRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 60]);

  return (
    <div ref={containerRef}>

      {/* ═══ NAV ═══ */}
      <nav className={`landing-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="app-topbar-brand">
          <BrandLogo />
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button className="btn btn-primary btn-sm" onClick={onOpenAuth}>
            Enter Canteen <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="landing-hero">
        <div className="landing-hero-bg" />

        <div className="landing-container">
          <motion.div style={{ opacity: heroOpacity, y: heroY }} className="flex flex-col">

            <motion.div
              className="chip"
              style={{ alignSelf: "flex-start", color: "var(--accent)", marginBottom: "var(--space-6)" }}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              <Zap size={14} />
              Next Generation Campus Dining
            </motion.div>

            <motion.h1
              style={{
                fontSize: "clamp(2.75rem, 7vw, 5.5rem)",
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "-0.04em",
                marginBottom: "var(--space-6)",
                maxWidth: "700px"
              }}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.1}
            >
              Taste the{" "}
              <span className="text-gradient">Future</span>
              <br />of Campus Dining
            </motion.h1>

            <motion.p
              style={{
                fontSize: "1.2rem",
                maxWidth: "500px",
                lineHeight: 1.7,
                marginBottom: "var(--space-8)"
              }}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.2}
            >
              Pre-order meals, skip the queue, and collect your food with a single tap. Built for students who value their time.
            </motion.p>

            <motion.div
              className="flex gap-4"
              style={{ flexWrap: "wrap" }}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.3}
            >
              <button className="btn btn-primary btn-lg" onClick={onOpenAuth}>
                Get Started <ArrowRight size={20} />
              </button>
              <a href="#how-it-works" className="btn btn-secondary btn-lg">
                See How It Works
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating accent orbs */}
        <motion.div
          style={{
            position: "absolute", right: "10%", top: "25%",
            width: 200, height: 200,
            borderRadius: "50%",
            background: "var(--accent-soft)",
            filter: "blur(80px)",
            pointerEvents: "none"
          }}
          animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          style={{
            position: "absolute", left: "5%", bottom: "20%",
            width: 150, height: 150,
            borderRadius: "50%",
            background: "var(--accent-secondary-soft)",
            filter: "blur(60px)",
            pointerEvents: "none"
          }}
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="landing-section">
        <div className="landing-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="landing-section-label">Simple Process</p>
            <h2 className="landing-section-title">
              Three taps. That's it.
            </h2>
          </motion.div>

          <div className="steps-grid">
            {[
              { num: "1", icon: Smartphone, title: "Browse & Order", desc: "Explore the live menu and add items to your tray. Prices update in real-time." },
              { num: "2", icon: ShieldCheck, title: "Pay Securely", desc: "Complete checkout through Razorpay. Bank-grade encryption protects every transaction." },
              { num: "3", icon: QrCode, title: "Scan & Collect", desc: "Show your QR code at the counter. The kitchen marks your order fulfilled instantly." },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="card card-interactive step-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <div className="step-number">{step.num}</div>
                <step.icon size={32} color="var(--accent)" style={{ margin: "0 auto var(--space-4)" }} />
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES — BENTO GRID ═══ */}
      <section className="landing-section">
        <div className="landing-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="landing-section-label">Why Tap2Eat?</p>
            <h2 className="landing-section-title">
              Excellence in every tap.
            </h2>
            <p className="landing-section-desc">
              From ordering to collection, every interaction is fast, invisible, and secure.
            </p>
          </motion.div>

          <div className="bento-grid">
            {[
              {
                icon: Zap, title: "Lightning Fast", color: "var(--accent)",
                bg: "var(--accent-soft)",
                desc: "Skip queues entirely. Order ahead and pick up exactly when you want — average collection time under 30 seconds.",
                wide: true
              },
              {
                icon: ShieldCheck, title: "Bank-Grade Security", color: "var(--accent-secondary)",
                bg: "var(--accent-secondary-soft)",
                desc: "Every payment processed through Razorpay's encrypted gateway. Your money is always safe."
              },
              {
                icon: ChefHat, title: "Live Kitchen Sync", color: "var(--warning)",
                bg: "var(--warning-soft)",
                desc: "Real-time order status updates straight from the kitchen to your device."
              },
              {
                icon: UtensilsCrossed, title: "Curated Daily Menus", color: "var(--accent)",
                bg: "var(--accent-soft)",
                desc: "Fresh selections every day, updated by the canteen team. From artisan pizza to specialty coffee — handpicked and freshly prepared.",
                wide: true
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                className={`card card-interactive bento-item ${item.wide ? "bento-wide" : ""}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="bento-icon" style={{ background: item.bg }}>
                  <item.icon size={28} color={item.color} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PLATFORM PILLARS ═══ */}
      <section className="landing-section">
        <div className="landing-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="landing-section-label">Built To Last</p>
            <h2 className="landing-section-title">
              Strong foundations from day one.
            </h2>
            <p className="landing-section-desc">
              Tap2Eat is designed around reliability, transparency, and ease of use so the experience feels premium from the very first order.
            </p>
          </motion.div>

          <div className="stats-grid">
            {[
              {
                icon: Zap,
                kicker: "Experience",
                number: "Queue-Free",
                label: "Pre-order before rush hour and collect quickly with a flow built to cut queue pressure."
              },
              {
                icon: QrCode,
                kicker: "Visibility",
                number: "Transparent",
                label: "Live order updates and QR handoff help students and canteen staff stay in sync."
              },
              {
                icon: ShieldCheck,
                kicker: "Trust",
                number: "Secure",
                label: "Trusted payment rails plus encrypted checkout protect each transaction end to end."
              },
              {
                icon: ChefHat,
                kicker: "Operations",
                number: "Role-Based",
                label: "Purpose-built views support students, kitchen teams, and canteen administrators."
              },
            ].map((pillar, i) => (
              <motion.div
                key={i}
                className="card stat-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
              >
                <div className="stat-icon">
                  <pillar.icon size={20} />
                </div>
                <div className="stat-kicker">{pillar.kicker}</div>
                <div className="stat-number">{pillar.number}</div>
                <div className="stat-label">{pillar.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="landing-cta">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="landing-container"
        >
          <Heart size={56} color="var(--accent)" style={{ marginBottom: "var(--space-6)", filter: "drop-shadow(0 0 15px var(--accent-glow))" }} />
          <h2 style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)", marginBottom: "var(--space-5)" }}>
            Ready to dine smarter?
          </h2>
          <p style={{ fontSize: "1.15rem", maxWidth: "480px", margin: "0 auto var(--space-8)" }}>
            Be among the first to experience a faster, smoother campus dining flow.
          </p>
          <button className="btn btn-primary btn-lg animate-pulse-glow" onClick={onOpenAuth}>
            Unlock Tap2Eat <ArrowRight size={20} />
          </button>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="app-topbar-brand" style={{ fontSize: "1.2rem" }}>
            <BrandLogo size="sm" />
          </div>
          <p>&copy; 2026 Tap2Eat — Premium Campus Dining</p>
        </div>
      </footer>
    </div>
  );
}