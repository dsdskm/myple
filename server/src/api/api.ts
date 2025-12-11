import https from 'https';
import fs from 'fs';
import * as path from 'path';
import { TossToken } from '../types/toss.token';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { TossUser } from '../types/toss.user';

// ----- 인증서/키 경로 (절대 경로 사용 권장) -----
const certPath = path.resolve(__dirname, '../../key/myple-mtls_public.crt');
const keyPath = path.resolve(__dirname, '../../key/myple-mtls_private.key');

const cert = fs.readFileSync(certPath);
const key = fs.readFileSync(keyPath);

export const requestTossAccessToken = async (
    authorizationCode: string,
    referrer: string
) => {
    const body = JSON.stringify({
        "authorizationCode": authorizationCode,
        "referrer": referrer,
    });

    const options: https.RequestOptions = {
        hostname: 'apps-in-toss-api.toss.im',
        path: '/api-partner/v1/apps-in-toss/user/oauth2/generate-token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(body),
        },
        cert,
        key,
        rejectUnauthorized: false, // 서버의 인증서를 검증
    };
    return new Promise<TossToken>((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                const jsonResult: TossToken = JSON.parse(data).success
                resolve(jsonResult)
            });
        });

        req.on('error', (e) => {
            console.error('Request error:', e);
        });

        req.write(body);

        req.end();
    })
};

export const requestTossLogout = async (userKey: string, referrer: string) => {

    const body = JSON.stringify({
        "userKey": userKey,
        "referrer": referrer
    });

    const options: https.RequestOptions = {
        hostname: 'apps-in-toss-api.toss.im',
        path: '/api-partner/v1/apps-in-toss/user/oauth2/access/remove-by-user-key',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(body),
        },
        cert,
        key,
        rejectUnauthorized: false, // 서버의 인증서를 검증
    };
    return new Promise<Boolean>((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                const jsonResult = JSON.parse(data).success
                if (jsonResult["userKey"] == userKey) {
                    resolve(true)
                } else {
                    resolve(false)
                }

            });
        });

        req.on('error', (e) => {
            console.error('Request error:', e);
        });

        req.write(body);

        req.end();
    })
}

export const requestTossUserInfo = async (
    accessToken: string
) => {
    const options: https.RequestOptions = {
        hostname: 'apps-in-toss-api.toss.im',
        path: '/api-partner/v1/apps-in-toss/user/oauth2/login-me',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${accessToken}`,
        },
        cert,
        key,
        rejectUnauthorized: false, // 서버의 인증서를 검증
    };
    return new Promise<TossUser>((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                const jsonResult: TossUser = JSON.parse(data).success
                resolve(jsonResult)
            });
        });

        req.on('error', (e) => {
            console.error('Request error:', e);
        });

        req.end();
    })
};