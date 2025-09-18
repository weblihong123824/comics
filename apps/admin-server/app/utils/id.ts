import { customAlphabet } from 'nanoid';

// 生成安全的ID，使用URL安全字符
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const generateId = customAlphabet(alphabet, 21);

export function createId(prefix?: string): string {
  const id = generateId();
  return prefix ? `${prefix}_${id}` : id;
}
