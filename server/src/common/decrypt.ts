// decrypt.ts
import * as crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();


export const _decryptUserData = (encryptedBase64: string, base64EncodedKey: string, aad: string) => {
    const IV_LENGTH = 12;

    const decoded = Buffer.from(encryptedBase64, 'base64');
    const key = Buffer.from(base64EncodedKey, 'base64');

    const iv = Buffer.from(decoded.subarray(0, IV_LENGTH));
    const ciphertext = Buffer.from(decoded.subarray(IV_LENGTH));

    const tag = Buffer.from(ciphertext.subarray(ciphertext.length - 16));
    const encrypted = Buffer.from(ciphertext.subarray(0, ciphertext.length - 16));

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAAD(Buffer.from(aad));
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
    ]);
    return decrypted.toString('utf-8');
}

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
