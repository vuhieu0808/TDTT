import { Server } from "socket.io";
import { WorkSession } from "../models/WorkSession.js";

export const emitNewSession = async (io: Server, workSession: WorkSession) => {
  const workSessionData = {
    ...workSession,
    createdAt: workSession.createdAt.toDate().toISOString(),
    participants: workSession.participants.map((participant) => ({
      ...participant,
      joinedAt: participant.joinedAt.toDate().toISOString(),
    })),
  };
  workSession.participants.forEach((participant) => {
    io.to(participant.uid).emit("new-work-session", workSessionData);
  });
};

export const emitStartSession = async (io: Server, workSession: WorkSession) => {
  const workSessionData = {
    ...workSession,
    createdAt: workSession.createdAt.toDate().toISOString(),
    participants: workSession.participants.map((participant) => ({
      ...participant,
      joinedAt: participant.joinedAt.toDate().toISOString(),
    })),
  };
  workSession.participants.forEach((participant) => {
    io.to(participant.uid).emit("start-work-session", workSessionData);
  });
}