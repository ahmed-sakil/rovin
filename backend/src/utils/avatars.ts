import { Gender } from '@prisma/client';

export const DEFAULT_AVATARS = {
  MALE: [
    '/assets/avatars/avatar-m1.svg',
    '/assets/avatars/avatar-m2.svg',
    '/assets/avatars/avatar-m3.svg',
  ],
  FEMALE: [
    '/assets/avatars/avatar-f1.svg',
    '/assets/avatars/avatar-f2.svg',
    '/assets/avatars/avatar-f3.svg',
  ],
  NEUTRAL: [
    '/assets/avatars/avatar-m1.svg',
    '/assets/avatars/avatar-f1.svg',
  ]
};

export function getRandomDefaultAvatar(gender: Gender): string {
  let pool: string[];

  switch (gender) {
    case Gender.FEMALE:
      pool = DEFAULT_AVATARS.FEMALE;
      break;
    case Gender.MALE:
      pool = DEFAULT_AVATARS.MALE;
      break;
    default:
      pool = [...DEFAULT_AVATARS.MALE, ...DEFAULT_AVATARS.FEMALE];
      break;
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
