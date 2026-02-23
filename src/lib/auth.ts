import { UserID, UserProfile } from "../types";

export const HARDCODED_USERS: Record<UserID, { name: string; avatar: string }> = {
  AV: { name: "AV", avatar: "A" },
  GN: { name: "GN", avatar: "G" }
};

export const APP_PASSWORD = "CHAUHAN@2009";

export const getInitialProfile = (id: UserID): UserProfile => ({
  uid: id,
  id,
  displayName: HARDCODED_USERS[id].name,
  avatar: HARDCODED_USERS[id].avatar,
  streak: 0,
  totalStudyHours: 0,
  habits: [],
  moodHistory: [],
  lastActive: Date.now()
});
