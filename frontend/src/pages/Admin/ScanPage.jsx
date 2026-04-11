import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { db, isOfflineMode } from "../../firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

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
            scanner.pause(); // Pause scanner
            
            const res = await fetch(VERIFY_API, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ qrToken: decodedText })
            });

            const data = await res.json();
            setResult({ success: res.ok, data });

            // Stop after successful scan
            if (res.ok) {
              await scanner.stop();
              
              // 🔄 Update order in Firestore Database
              try {
                if (isOfflineMode) {
                   // OFFLINE DEMO BYPASS: just pretend it worked
                   console.log("Offline bypass: Order scanned and updated");
                   return;
                }
                const q = query(collection(db, "orders"), where("qrToken", "==", decodedText));
                const snapshot = await getDocs(q);
                
                // Automatically mark the scanned order(s) as completed
                const updatePromises = snapshot.docs.map((docSnap) => 
                  updateDoc(doc(db, "orders", docSnap.id), { orderStatus: "completed" })
                );
                await Promise.all(updatePromises);
              } catch (delErr) {
                console.error("Failed to update order in firestore:", delErr);
              }
              
            } else {
              if (scanner.resume) {
                scanner.resume(); // Resume if invalid to try again
              }
            }

          } catch (err) {
            console.error(err);
            setResult({ success: false, data: { message: "Network error occurred." } });
            if (scanner.resume) {
               scanner.resume();
            }
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
    <div style={{ textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2 style={{ margin: 0 }}>QR Scanner 📷</h2>
        <button className="btn btn-outline" onClick={() => navigate("/")} style={{ padding: "8px 15px", fontSize: "0.9rem" }}>
          Cancel
        </button>
      </div>

      <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
        Align the student's QR code within the frame to verify their order.
      </p>

      {!result?.success && (
        <div className="qr-container" style={{ padding: "10px", width: "100%", maxWidth: "350px", overflow: "hidden", margin: "0 auto 20px" }}>
          <div
            id="reader"
            style={{ width: "100%", border: "none", borderRadius: "10px" }}
          />
          {loading && (
            <div style={{ margin: "15px 0", color: "var(--secondary)", fontWeight: "600", display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
              <span className="loader" style={{ width: '20px', height: '20px', borderWidth: '2px', borderColor: "rgba(0,0,0,0.1)", borderTopColor: "var(--secondary)" }}></span> Processing Scan...
            </div>
          )}
        </div>
      )}

      {result && (
        <div className="order-card" style={{ marginTop: "20px", borderLeftColor: result.success ? "#40c057" : "#fa5252", textAlign: "center" }}>
          <h3 style={{ color: result.success ? "#40c057" : "#fa5252", fontSize: "1.5rem" }}>
            {result.success ? "✅ Order Verified!" : "❌ Invalid QR"}
          </h3>
          <p style={{ fontSize: "1.1rem", margin: "15px 0" }}>
            {result.data?.message || "Successfully processed"}
          </p>
          
          {result.success && (
            <button className="btn btn-secondary" onClick={() => navigate("/")} style={{ marginTop: "15px" }}>
              Back to Dashboard
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ScanPage;