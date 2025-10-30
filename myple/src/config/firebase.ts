import * as admin from 'firebase-admin';

// .env 파일에서 GOOGLE_APPLICATION_CREDENTIALS 환경변수를 자동으로 읽어 초기화합니다.
// 이미 초기화된 앱이 있는 경우 중복 초기화를 방지합니다.
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    });
    console.log('Firebase Admin SDK Initialized.');
}

// Firestore 데이터베이스 인스턴스를 export 합니다.
export const db = admin.firestore();
