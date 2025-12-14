import admin from "firebase-admin";
import { Database } from "firebase-admin/database";
// import serviceAccount from "./serviceAccountKey.json" with { type: "json" };
const firebaseAdminCredential = process.env.FIREBASE_ADMIN
if(!firebaseAdminCredential) {
  throw new Error("FIREBASE_ADMIN missing in .env");
}
let serviceAccount: object;
try {
  const decoded = Buffer.from(firebaseAdminCredential, "base64").toString("utf8");
  serviceAccount = JSON.parse(decoded);
} catch {
  throw new Error("failed to parse FIREBASE_ADMIN");
}

const databaseURL = process.env.RTDB_URL || "https://your-default-database-url.firebaseio.com";
console.log("Initializing Firebase admin with DB URL:", databaseURL);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: databaseURL,
});

const db = admin.firestore();
const rtdb: Database = admin.database();

console.log("Firebase admin initialized");

export { admin, db, rtdb };
