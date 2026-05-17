import { User, type UserDoc } from '../models/User';
import { signToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import type { LoginInput, RegisterInput } from '../utils/validators';

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

function toPublic(user: UserDoc): PublicUser {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}

export async function register(input: RegisterInput): Promise<{ token: string; user: PublicUser }> {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    // Repair half-created accounts (e.g. from a failed earlier attempt)
    if (!existing.passwordHash) {
      existing.passwordHash = await User.hashPassword(input.password);
      existing.name = input.name;
      await existing.save();
      const token = signToken({ sub: existing._id.toString(), email: existing.email });
      return { token, user: toPublic(existing) };
    }
    throw AppError.conflict('Email already registered');
  }
  const passwordHash = await User.hashPassword(input.password);
  const user = await User.create({
    email: input.email,
    name: input.name,
    passwordHash,
  });
  const token = signToken({ sub: user._id.toString(), email: user.email });
  return { token, user: toPublic(user) };
}

export async function login(input: LoginInput): Promise<{ token: string; user: PublicUser }> {
  const user = await User.findOne({ email: input.email });
  if (!user || !user.passwordHash) {
    throw AppError.unauthorized('Invalid credentials');
  }
  const ok = await user.comparePassword(input.password);
  if (!ok) {
    throw AppError.unauthorized('Invalid credentials');
  }
  const token = signToken({ sub: user._id.toString(), email: user.email });
  return { token, user: toPublic(user) };
}

export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const user = await User.findById(userId);
  if (!user) {
    throw AppError.notFound('User not found');
  }
  return toPublic(user);
}
