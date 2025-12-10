// decrypt.ts
import * as crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

/**
 * AES‑256‑GCM 복호화 함수
 *
 * @param encryptedBase64   - 암호문 (Base64 인코딩, IV + ciphertext + tag)
 * @param base64EncodedKey  - AES‑256 키 (Base64)
 * @param aad               - Additional Authenticated Data (UTF‑8 문자열)
 * @returns 복호화된 평문 (UTF‑8 문자열)
 *
 * @throws Error 복호화에 실패하거나 입력이 올바르지 않을 경우
 */
export function decryptUserData(
    encryptedBase64: string,
): string {
    if (!encryptedBase64) {
        return ""
    }
    const IV_LENGTH = 12;          // GCM nonce 길이
    const TAG_LENGTH = 16;         // GCM tag 길이

    // 1️⃣ Base64 → Buffer 변환

    const decoded = Buffer.from(encryptedBase64, 'base64');
    const key = Buffer.from(process.env.TOSS_DECRYPT_KEY || "", 'base64');

    // 2️⃣ 입력 길이 검증 (IV + tag 가 최소 12+16 바이트 이상이어야 함)
    if (decoded.length < IV_LENGTH + TAG_LENGTH) {
        throw new Error('암호문이 너무 짧습니다. IV 혹은 tag 가 누락되었습니다.');
    }

    // 3️⃣ IV, ciphertext, tag 분리
    const iv = decoded.subarray(0, IV_LENGTH);                     // 12 바이트
    const ciphertextWithTag = decoded.subarray(IV_LENGTH);        // ciphertext + tag
    const tag = ciphertextWithTag.subarray(-TAG_LENGTH);          // 마지막 16 바이트
    const ciphertext = ciphertextWithTag.subarray(0, -TAG_LENGTH); // tag 제외한 부분

    // 4️⃣ GCM 복호화 객체 생성
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);

    // 5️⃣ AAD 설정 (인증에만 사용)
    decipher.setAAD(Buffer.from(process.env.TOSS_AAD || "", 'utf8'));

    // 6️⃣ 인증 태그 지정
    decipher.setAuthTag(tag);

    // 7️⃣ 실제 복호화
    let decrypted = decipher.update(ciphertext);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    // 8️⃣ 문자열 반환
    return decrypted.toString('utf8');
}
