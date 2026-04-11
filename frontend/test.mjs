import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";

const app = initializeApp({
  apiKey: "REMOVED_FOR_SECURITY",
  projectId: "REMOVED_FOR_SECURITY"
});

const db = getFirestore(app);

async function run() {
  try {
    const q = query(collection(db, "orders"), limit(2));
    const snap = await getDocs(q);
    snap.forEach(d => {
      console.log("ID: ", d.id);
      console.log("DATA: ", JSON.stringify(d.data(), null, 2));
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
