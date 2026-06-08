export const RolesConst = {
  ADMIN: 'ADMIN',
  KADER: 'KADER',
} as const;

export type AppRole = (typeof RolesConst)[keyof typeof RolesConst];
