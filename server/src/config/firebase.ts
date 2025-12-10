import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();
// service_account.json 파일 경로 (필요에 따라 조정)
const serviceAccountPath = path.resolve(__dirname, '../../key', 'service_account.json');

// 파일을 읽고 JSON 객체로 파싱
let serviceAccount: any;
try {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
} catch (err) {
    console.error('Failed to read service account file:', err);
    process.exit(1);
}


// 필수 필드가 있는지 간단히 검증
const {
    project_id,
    client_email,
    private_key,
    private_key_id,
} = serviceAccount;


// 이미 초기화된 앱이 있으면 재초기화 방지
if (!admin.apps.length) {
    // private_key_id 가 있으면 private_key 로 사용하고, 없으면 private_key 를 그대로 사용
    const certOptions = {
        projectId: project_id,
        clientEmail: client_email,
        privateKey: private_key,
        privateKeyId: private_key_id || undefined,
    }
    admin.initializeApp({
        credential: admin.credential.cert(certOptions),
    });

    console.log('Firebase Admin SDK Initialized.');
}

// Firestore 인스턴스 export
export const db = admin.firestore();
const gcs = admin.storage();
export const bucket = gcs.bucket(process.env.GCS_BUCKET_NAME || '');
bucket.makePublic()