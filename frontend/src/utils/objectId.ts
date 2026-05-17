/** MongoDB ObjectId string (24 hex chars). */
export function isValidObjectId(id: string | undefined | null): boolean {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
}
