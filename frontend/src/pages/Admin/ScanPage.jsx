import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { db, isOfflineMode } from "../../firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { motion } from "framer-motion";
import { ScanLine, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

const VERIFY_API = import.meta.env.VITE_VERIFY_QR_API;

function ScanPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          try {
            setLoading(true);
            scanner.pause();

            const res = await fetch(VERIFY_API, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ qrToken: decodedText })
            });

            const data = await res.json();
            setResult({ success: res.ok, data });

            if (res.ok) {
              await scanner.stop();
              try {
                if (isOfflineMode) {
                  console.log("Offline bypass: Order scanned and updated");
                  return;
                }
                const q = query(collection(db, "orders"), where("qrToken", "==", decodedText));
                const snapshot = await getDocs(q);
                const updatePromises = snapshot.docs.map((docSnap) =>
                  updateDoc(doc(db, "orders", docSnap.id), { orderStatus: "completed" })
                );
                await Promise.all(updatePromises);
              } catch (delErr) {
                console.error("Failed to update order in firestore:", delErr);
              }
            } else {
              if (scanner.resume) scanner.resume();
            }
          } catch (err) {
            console.error(err);
            setResult({ success: false, data: { message: "Network error occurred." } });
            if (scanner.resume) scanner.resume();
          } finally {
            setLoading(false);
          }
        }
      )
      .catch((err) => console.error("Camera error:", err));

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="admin-page-header">
        <div>
          <h2>
            <ScanLine size={28} color="var(--accent)" />
            QR Scanner
          </h2>
          <p>Scan student QR codes to fulfill their orders</p>
        </div>
      </div>

      {!result?.success && (
        <div style={{ textAlign: "center" }}>
          <div className="scanner-container" style={{ marginBottom: "var(--space-6)" }}>
            <div id="reader" style={{ width: "100%", border: "none" }} />
          </div>

          {loading && (
            <div className="flex items-center gap-3" style={{ justifyContent: "center", color: "var(--accent)" }}>
              <span className="loader" style={{ width: 20, height: 20, borderWidth: 2 }} />
              <span style={{ fontWeight: 600 }}>Processing scan...</span>
            </div>
          )}

          <p style={{ color: "var(--text-muted)", marginTop: "var(--space-4)", fontSize: "0.9rem" }}>
            Align the student's QR code within the frame
          </p>
        </div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`card scan-result ${result.success ? "scan-result-success" : "scan-result-error"}`}
          style={{ padding: "var(--space-8)", textAlign: "center", maxWidth: 480, margin: "0 auto" }}
        >
          {result.success ? (
            <CheckCircle2 size={56} color="var(--success)" style={{ margin: "0 auto var(--space-4)" }} />
          ) : (
            <XCircle size={56} color="var(--danger)" style={{ margin: "0 auto var(--space-4)" }} />
          )}

          <h3 style={{ fontSize: "1.5rem", marginBottom: "var(--space-3)", color: result.success ? "var(--success)" : "var(--danger)" }}>
            {result.success ? "Order Verified!" : "Invalid QR Code"}
          </h3>

          <p style={{ fontSize: "1.05rem", marginBottom: "var(--space-6)" }}>
            {result.data?.message || "Successfully processed"}
          </p>

          {result.success && (
            <button className="btn btn-primary" onClick={() => navigate("/")}>
              Back to Dashboard
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export default ScanPage;