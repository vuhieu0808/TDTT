import admin from "firebase-admin";
import { Database } from "firebase-admin/database";
import serviceAccount from "./serviceAccountKey.json" with { type: "json" };

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
