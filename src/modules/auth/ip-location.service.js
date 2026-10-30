
'use strict';

const https = require('https');

function fetchJson(url, timeoutMs = 3000) {
    return new Promise((resolve, reject) => {
        const request = https.get(
            url,
            {
                headers: {
                    Accept: 'application/json',
                    'User-Agent': 'Keyzoo-Backend/1.0',
                },
            },
            (response) => {
                let body = '';

                response.setEncoding('utf8');

                response.on('data', (chunk) => {
                    body += chunk;
                });

                response.on('end', () => {
                    if (
                        response.statusCode < 200 ||
                        response.statusCode >= 300
                    ) {
                        return reject(
                            new Error(
                                `IP lookup failed: HTTP ${response.statusCode}`
                            )
                        );
                    }

                    try {
                        resolve(JSON.parse(body));
                    } catch {
                        reject(
                            new Error('Invalid IP lookup response')
                        );
                    }
                });
            }
        );

        request.setTimeout(timeoutMs, () => {
            request.destroy(
                new Error('IP lookup timed out')
            );
        });

        request.on('error', reject);
    });
}

async function getIpLocation(ipAddress) {
    if (
        typeof ipAddress !== 'string' ||
        !ipAddress.trim()
    ) {
        return null;
    }

    try {
        const url = new URL(
            `https://ipdata.free/${encodeURIComponent(ipAddress.trim())}`
        );

        const data = await fetchJson(url.toString());

        return {

            country: data.country || null,
            region: data.region || null,
            city: data.city || null,
            timezone: data.timezone || null,
            latitude: data.latitude ?? null,
            longitude: data.longitude ?? null,
            postal: data.postal || null,
            isp: data.org || null,
            asn: data.asn || null,
            
        };

    } catch (error) {
        console.error(
            '[IP Location] Lookup failed:',
            error.message
        );

        return null;
    }
}

module.exports = {
    getIpLocation,
};
