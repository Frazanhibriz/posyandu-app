import type { User } from '@prisma/client';

export type UserWithoutPassword = Omit<User, 'password'>;

export function omitPassword(user: User): UserWithoutPassword {
  // Kita buat objek baru secara eksplisit dari data yang ada
  const userObj = { ...user };
  delete (userObj as any).password;
  
  return userObj as UserWithoutPassword;
}