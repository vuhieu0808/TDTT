import { admin } from "../config/firebase.js";
import { workSessionDB } from "../models/db.js";
import { io } from "../socket/index.js";

import { Participant } from "../models/Conversation.js";
import { ScheduleSession, SessionGoal, WorkSession } from "../models/WorkSession.js";
import { emitNewSession, emitStartSession } from "../utils/WorkSessionHelper.js";

export const WorkSessionServices = {
  // sửa any khi có db
  async createWorkSession(
    participants: Participant[],
    schedule: ScheduleSession,
    location?: any,
    goals?: SessionGoal[]
  ): Promise<WorkSession> {
    const workSessionRef = workSessionDB.doc();
    const participantIds = participants.map((p) => p.uid);
    const newWorkSession: WorkSession = {
      id: workSessionRef.id,
      participants,
      participantIds,
      status: "pending" as const,
      schedule,
      location,
      ...(goals ? { goals } : {}),
      createdAt: admin.firestore.Timestamp.now(),
    };
    await workSessionRef.set(newWorkSession);
    await emitNewSession(io, newWorkSession);
    return newWorkSession;
  },

  async getWorkSessionsForUser(userId: string): Promise<WorkSession[]> {
    const snapshot = await workSessionDB
      .where("participantIds", "array-contains", userId)
      .orderBy("scheduledAt", "desc")
      .get();
    let workSessions: WorkSession[] = [];
    snapshot.forEach((doc) => {
      workSessions.push(doc.data() as WorkSession);
    });
    return workSessions;
  },

  async updateWorkSession(
    workSessionId: string,
    updateData: Partial<WorkSession>
  ): Promise<void> {
    const workSessionRef = workSessionDB.doc(workSessionId);
    await workSessionRef.update(updateData);
  },

  async confirmWorkSession(
    workSessionId: string,
    userId: string
  ): Promise<void> {
    const workSessionRef = workSessionDB.doc(workSessionId);
    const workSessionSnap = await workSessionRef.get();
    if (!workSessionSnap.exists) {
      throw new Error("Work session not found");
    }
    const workSession = workSessionSnap.data() as WorkSession;
    if (!workSession.participantIds.includes(userId)) {
      throw new Error("User is not a participant of this work session");
    }
    await workSessionRef.update({ status: "confirmed" });
  },

  async cancelWorkSession(
    workSessionId: string,
    userId: string
  ): Promise<void> {
    const workSessionRef = workSessionDB.doc(workSessionId);
    const workSessionSnap = await workSessionRef.get();
    if (!workSessionSnap.exists) {
      throw new Error("Work session not found");
    }
    const workSession = workSessionSnap.data() as WorkSession;
    if (!workSession.participantIds.includes(userId)) {
      throw new Error("User is not a participant of this work session");
    }
    await workSessionRef.update({ status: "canceled" });
  },

  async completeWorkSession(
    workSessionId: string,
    userId: string
  ): Promise<void> {
    const workSessionRef = workSessionDB.doc(workSessionId);
    const workSessionSnap = await workSessionRef.get();
    if (!workSessionSnap.exists) {
      throw new Error("Work session not found");
    }
    const workSession = workSessionSnap.data() as WorkSession;
    if (!workSession.participantIds.includes(userId)) {
      throw new Error("User is not a participant of this work session");
    }
    await workSessionRef.update({ status: "completed" });
  },

  async startWorkSession(workSessionId: string, userId: string): Promise<void> {
    const workSessionRef = workSessionDB.doc(workSessionId);
    const workSessionSnap = await workSessionRef.get();
    if (!workSessionSnap.exists) {
      throw new Error("Work session not found");
    }
    const workSession = workSessionSnap.data() as WorkSession;
    if (!workSession.participantIds.includes(userId)) {
      throw new Error("User is not a participant of this work session");
    }
    await workSessionRef.update({ status: "active" });
    workSession.status = "active";
    await emitStartSession(io, workSession);
  },
};
