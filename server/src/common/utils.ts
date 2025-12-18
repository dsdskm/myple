import os from 'os';

export const getFormattedDateForAccount = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const dayOfWeek = days[date.getDay()];

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${dayOfWeek} ${hours}:${minutes}`;
};

export const getFormattedDateForFile = (): string => {
    const date = new Date()
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const mil = date.getMilliseconds().toString().padStart(3, '0');

    return `${year}${month}${day}${hours}${minutes}${mil}`;
};

export const getLocal192IP = (fallback: string = "127.0.0.1"): string => {
    const interfaces = os.networkInterfaces();

    // 인터페이스 객체를 배열 형태로 순회
    for (const ifaceName of Object.keys(interfaces)) {
        const iface = interfaces[ifaceName];
        if (!iface) continue

        // 각 인터페이스는 여러 alias(IP 주소)로 구성될 수 있음
        for (const alias of iface) {
            // IPv4 주소만 대상으로 함
            if (alias.family !== "IPv4") continue;

            const ip = alias.address;
            if (!ip) continue;

            // 192.168.*.* 패턴인지 확인
            if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(ip)) {
                return ip; // 첫 번째 매칭된 주소 반환
            }
        }
    }

    // 매칭된 주소가 없을 경우 fallback 반환
    return fallback;
};