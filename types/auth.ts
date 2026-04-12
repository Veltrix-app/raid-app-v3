export type AppUserProfile = {
  id: string;
  authUserId: string;
  username: string;
  avatarUrl: string;
  bannerUrl: string;
  title: string;
  faction: string;
  bio: string;
  wallet: string;
  xp: number;
  level: number;
  streak: number;
  status: "active" | "flagged";
};