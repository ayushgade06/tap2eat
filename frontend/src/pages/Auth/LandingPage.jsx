import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Coffee, Pizza, Croissant, ShieldCheck, Zap, Heart, ChefHat } from "lucide-react";

const SparkleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
  </svg>
);

const FloatingPizza = ({ scrollYProgress }) => {
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 180]);
  return (
    <motion.div
      style={{ position: "absolute", right: "8%", top: "15%", rotate }}
      animate={{ y: [0, -20, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <div style={{
        padding: "40px",
        background: "rgba(255,107,107,0.12)",
        borderRadius: "50%",
        boxShadow: "0 0 80px rgba(255,107,107,0.3)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,107,107,0.25)"
      }}>
        <Pizza size={100} color="#ff6b6b" />
      </div>
    </motion.div>
  );
};

const FloatingCoffee = ({ scrollYProgress }) => {
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  return (
    <motion.div
      style={{ position: "absolute", right: "20%", bottom: "12%", y }}
      animate={{ y: [0, 20, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
    >
      <div style={{
        padding: "28px",
        background: "rgba(255,255,255,0.05)",
        borderRadius: "50%",
        boxShadow: "0 0 60px rgba(255,255,255,0.06)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <Coffee size={70} color="rgba(255,255,255,0.7)" />
      </div>
    </motion.div>
  );
};

const HeroContent = ({ scrollYProgress, onOpenAuth }) => {
  const opacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.25], [0, 80]);

  return (
    <motion.div style={{ opacity, y, maxWidth: "760px", position: "relative", zIndex: 10 }}>
      <motion.div
        className="glass-pill"
        style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "28px", color: "#ff6b6b" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <SparkleIcon /> Next Generation Campus Dining
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        style={{
          fontSize: "clamp(3.5rem, 8vw, 7rem)",
          fontWeight: 900,
          lineHeight: 0.95,
          letterSpacing: "-0.04em",
          margin: "0 0 24px 0"
        }}
      >
        Taste the{" "}
        <span style={{
          background: "linear-gradient(135deg, #ff6b6b, #ff8e53)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          Future
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{ fontSize: "1.25rem", opacity: 0.65, maxWidth: "540px", lineHeight: 1.65, marginBottom: "44px" }}
      >
        Experience frictionless campus dining. Pre-order, skip queues, and collect your food with a single tap.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}
      >
        <button
          className="btn-primary"
          onClick={onOpenAuth}
          style={{ padding: "18px 40px", fontSize: "1.15rem" }}
        >
          Enter Canteen <ArrowRight size={20} />
        </button>
        <button className="btn-secondary" style={{ padding: "18px 28px", fontSize: "1.1rem" }}>
          Learn More
        </button>
      </motion.div>
    </motion.div>
  );
};

const TiltCard = ({ icon: Icon, title, desc, color, delay = 0 }) => (
  <motion.div
    className="glass-panel"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    whileHover={{ y: -8, scale: 1.02 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, delay }}
    style={{ padding: "36px 28px" }}
  >
    <div style={{
      width: "72px", height: "72px",
      background: `${color}18`,
      borderRadius: "20px",
      display: "flex", alignItems: "center", justifyContent: "center",
      marginBottom: "24px",
      boxShadow: `0 0 30px ${color}30`
    }}>
      <Icon size={36} color={color} />
    </div>
    <h3 style={{ fontSize: "1.5rem", marginBottom: "12px" }}>{title}</h3>
    <p style={{ opacity: 0.65, lineHeight: 1.6, fontSize: "1.05rem" }}>{desc}</p>
  </motion.div>
);

const FeatureCard = ({ icon: Icon, title, desc, index }) => (
  <motion.div
    className="glass-panel"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.5, delay: index * 0.15 }}
    style={{ display: "flex", alignItems: "flex-start", gap: "20px", padding: "28px" }}
  >
    <div style={{
      width: "56px", height: "56px", flexShrink: 0,
      background: "rgba(255,107,107,0.12)",
      borderRadius: "16px",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <Icon size={28} color="#ff6b6b" />
    </div>
    <div>
      <h3 style={{ fontSize: "1.3rem", marginBottom: "8px" }}>{title}</h3>
      <p style={{ opacity: 0.65, lineHeight: 1.6 }}>{desc}</p>
    </div>
  </motion.div>
);

export default function LandingPage({ onOpenAuth }) {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const bgOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 1]);

  return (
    <div ref={containerRef} style={{ background: "#0f1014" }}>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section style={{
        minHeight: "100vh",
        padding: "100px 5% 80px",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Background Gradient */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 60% at 60% 30%, rgba(255,107,107,0.12), transparent)"
        }} />

        {/* Floating Grid Lines */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }} />

        <div className="container" style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "0 5%" }}>
          <HeroContent scrollYProgress={scrollYProgress} onOpenAuth={onOpenAuth} />
          <FloatingPizza scrollYProgress={scrollYProgress} />
          <FloatingCoffee scrollYProgress={scrollYProgress} />
        </div>
      </section>

      {/* ═══════════════════ SHOWCASE ═══════════════════ */}
      <section style={{ padding: "120px 5%", position: "relative" }}>
        <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ marginBottom: "70px" }}
          >
            <p style={{ color: "#ff6b6b", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
              Our Highlights
            </p>
            <h2 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", maxWidth: "560px" }}>
              Savor every selection
            </h2>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            <TiltCard icon={Pizza} title="Artisan Pizza" desc="Hand-tossed masterpieces baked fresh daily in our stone ovens." color="#ff6b6b" delay={0} />
            <TiltCard icon={Croissant} title="Morning Pastries" desc="Golden, flaky pastries crafted at dawn for the perfect start." color="#f5a623" delay={0.1} />
            <TiltCard icon={Coffee} title="Specialty Coffee" desc="Single-origin beans, expertly brewed to energize your day." color="#4fc3f7" delay={0.2} />
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES (Sticky Scroll) ═══════════════════ */}
      <section style={{ padding: "120px 5%" }}>
        <div style={{
          width: "100%", maxWidth: "1200px", margin: "0 auto",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "start"
        }}>
          <div style={{ position: "sticky", top: "20vh" }}>
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p style={{ color: "#ff6b6b", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
                Why Tap2Eat?
              </p>
              <h2 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", marginBottom: "24px" }}>
                Excellence<br />in every tap.
              </h2>
              <p style={{ fontSize: "1.15rem", opacity: 0.65, lineHeight: 1.7, marginBottom: "40px" }}>
                From order to collection, the entire experience is invisible, secure, and blazing fast.
              </p>
              <button className="btn-primary" onClick={onOpenAuth} style={{ padding: "16px 36px" }}>
                Get Started <ArrowRight size={18} />
              </button>
            </motion.div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingTop: "10vh" }}>
            {[
              { icon: Zap, title: "Lightning Fast Ordering", desc: "Skip the queues. Order ahead and pick up exactly when you want." },
              { icon: ShieldCheck, title: "Secure Payments via Razorpay", desc: "Bank-grade encryption for every campus transaction you make." },
              { icon: ChefHat, title: "Live Kitchen Sync", desc: "Real-time status updates straight from the kitchen to your phone." },
            ].map((f, i) => (
              <FeatureCard key={i} index={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section style={{ padding: "80px 5%" }}>
        <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
            {[
              { number: "5,000+", label: "Orders Served" },
              { number: "200+", label: "Menu Items" },
              { number: "99.9%", label: "Uptime" },
              { number: "<30s", label: "Avg Pickup Time" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="glass-panel"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ textAlign: "center", padding: "40px 24px" }}
              >
                <div style={{ fontSize: "3rem", fontWeight: 900, color: "#ff6b6b", marginBottom: "8px" }}>
                  {stat.number}
                </div>
                <div style={{ opacity: 0.6, fontSize: "1.05rem" }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section style={{
        padding: "140px 5%",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,107,107,0.1), transparent)"
        }} />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Heart size={64} color="#ff6b6b" style={{ marginBottom: "28px", filter: "drop-shadow(0 0 20px rgba(255,107,107,0.5))" }} />
          <h2 style={{ fontSize: "clamp(3rem, 6vw, 5rem)", marginBottom: "20px" }}>Ready to dine?</h2>
          <p style={{ fontSize: "1.25rem", opacity: 0.65, maxWidth: "540px", margin: "0 auto 44px", lineHeight: 1.65 }}>
            Join thousands of students experiencing the future of campus hospitality.
          </p>
          <button
            className="btn-primary"
            onClick={onOpenAuth}
            style={{ padding: "22px 64px", fontSize: "1.25rem" }}
          >
            Unlock Tap2Eat
          </button>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "40px 5%",
        textAlign: "center",
        opacity: 0.5
      }}>
        <p>&copy; 2026 Tap2Eat — Premium Campus Dining</p>
      </footer>
    </div>
  );
}
