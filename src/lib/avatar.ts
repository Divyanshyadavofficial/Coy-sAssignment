// Sketch-style avatars: crisp at any size, and fit Coy's no-real-photos vibe.
const AVATAR_BG = ["ffd84d", "8ee3c0", "c7b5ff", "9fd3ff", "ffb3cb", "ffc285"];
export const avatarUrl = (seed: string, i: number) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${AVATAR_BG[i % AVATAR_BG.length]}`;

export const ME_AVATAR = avatarUrl("you-coy", 4);
