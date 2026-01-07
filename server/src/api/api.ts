import https from 'https';
import fs from 'fs';
import * as path from 'path';
import { TossToken } from '../types/toss.token';
import dotenv from 'dotenv';
import { TossUser } from '../types/account';
dotenv.config();

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

export const requestAddress = async (latitude: number, longitude: number): Promise<string> => {
    const apiKey = process.env.GCP_MAP_KEY;
    if (!apiKey) {
        throw new Error('Google Maps API Key is missing');
    }

    const options: https.RequestOptions = {
        hostname: 'maps.googleapis.com',
        path: `/maps/api/geocode/json?latlng=${encodeURIComponent(latitude)},${encodeURIComponent(longitude)}&key=${apiKey}&language=ko&region=kr`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
    };

    return new Promise<any>((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.status !== 'OK' || !result.results || result.results.length === 0) {
                        resolve(null); // 결과가 없거나 상태가 OK가 아닐 경우 null 반환
                        return;
                    }

                    // 가장 신뢰도 높은 주소 선택
                    const bestResult = result.results.reduce((best: any, current: any) => {
                        const bestScore = calculateScore(best);
                        const currentScore = calculateScore(current);
                        return currentScore > bestScore ? current : best;
                    }, result.results[0]);

                    // 가장 신뢰성 있는 전체 주소만 반환
                    resolve(bestResult.formatted_address || null);

                } catch (err) {
                    reject(new Error('Failed to parse response data'));
                }
            });
        });

        req.on('error', (err) => {
            reject(new Error(`Request error: ${err.message}`));
        });

        req.write('');
        req.end();
    });
};

function calculateScore(result: any): number {
    let score = 0;

    // 주소 구성 요소 점수
    if (result.address_components) {
        const requiredComponents = [
            'street_number', 'route', 'locality', 'administrative_area_level_1', 'country'
        ];
        requiredComponents.forEach(comp => {
            if (result.address_components.some((c: any) => c.types.includes(comp))) {
                score += 2;
            }
        });
    }

    // 위치 정확도 점수
    if (result.geometry?.location_type === 'ROOFTOP' || result.geometry?.location_type === 'RANGE_INTERPOLATED') {
        score += 3;
    } else if (result.geometry?.location_type === 'APPROXIMATE') {
        score += 1;
    }

    // 포맷된 주소 존재 여부
    if (result.formatted_address) {
        score += 2;
    }

    return score;
}