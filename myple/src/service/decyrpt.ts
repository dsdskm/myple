// decrypt.ts
import { randomBytes, createDecipheriv } from 'crypto';

/**
 * AES‑256‑GCM 복호화
 *
 * @param encryptedText  Base64 로 인코딩된 ciphertext (IV + ciphertext + tag)
 * @param base64Key      AES‑256 키 (Base64)
 * @param aad            Additional Authenticated Data (UTF‑8 문자열)
 * @returns 복호화된 문자열 (UTF‑8)
 */

const base64EncodedAesKey = process.env.REACT_APP_TOSS_DECRYPT_KEY || ""
const aad = process.env.REACT_APP_TOSS_AAD || ""

export function decrypt(
  encryptedText: string,
): string {
  // 1️⃣ 상수 정의
  const IV_LENGTH = 12;   // GCM nonce (12 byte)
  const TAG_LENGTH = 16;  // GCM tag (16 byte)

  // 2️⃣ Base64 → Buffer 변환
  const decoded = Buffer.from(encryptedText, 'base64');
  const key = Buffer.from(base64EncodedAesKey, 'base64');

  // 3️⃣ IV, ciphertext, tag 분리
  if (decoded.length < IV_LENGTH + TAG_LENGTH) {
    throw new Error('암호문이 너무 짧습니다. IV 혹은 tag 가 누락되었습니다.');
  }

  const iv = decoded.subarray(0, IV_LENGTH);
  const ciphertextWithTag = decoded.subarray(IV_LENGTH);
  const tag = ciphertextWithTag.subarray(-TAG_LENGTH);
  const ciphertext = ciphertextWithTag.subarray(0, -TAG_LENGTH);

  // 4️⃣ GCM 복호화 객체 생성
  const decipher = createDecipheriv('aes-256-gcm', key, iv);

  // 5️⃣ AAD 설정 (인증에만 사용)
  decipher.setAAD(Buffer.from(aad, 'utf8'));

  // 6️⃣ 실제 복호화
  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);


  // 8️⃣ 문자열 반환
  return decrypted.toString('utf8');
}