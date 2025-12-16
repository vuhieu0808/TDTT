import { matchingTelemetryDB } from "../models/db.js";
import { FieldValue } from 'firebase-admin/firestore';

type MatchingTelemetryData = {
    stillMatching: boolean;
    currentSession: number;
    history: number[];
}

function initMatchingTelemetryData(): MatchingTelemetryData {
    return {
        stillMatching: true,
        currentSession: 0,
        history: [],
    };
}

export async function subscribe(userId: string): Promise<void> {
    const telemetryDoc = matchingTelemetryDB.doc(userId);
    const snapshot = await telemetryDoc.get();
    try {
        if (!snapshot.exists) {
            await telemetryDoc.set(initMatchingTelemetryData());
        } else {
            await telemetryDoc.update({ stillMatching: true });
        }
    } catch (error) {
        console.log("[matchingTelemetry] Error subscribing for user:", userId, error);
    }
}

export async function unsubscribe(userId: string): Promise<void> {
    const telemetryDoc = matchingTelemetryDB.doc(userId);
    const snapshot = await telemetryDoc.get();

    if(snapshot.exists) {
        const data = snapshot.data() as MatchingTelemetryData;
        data.history.push(data.currentSession);
        data.currentSession = 0;
        data.stillMatching = false;

        try {
            await telemetryDoc.update(data);
        } catch (error) {
            console.log("[matchingTelemetry] Error unsubscribing for user:", userId, error);
        }
    }
}

export async function increment(userId: string): Promise<void> {
    const telemetryDoc = matchingTelemetryDB.doc(userId);
    const snapshot = await telemetryDoc.get();

    if(snapshot.exists) {
        try {
            await telemetryDoc.update({ currentSession: FieldValue.increment(1) });
        } catch (error) {
            console.log("[matchingTelemetry] Error incrementing for user:", userId, error);
        }
    }
}