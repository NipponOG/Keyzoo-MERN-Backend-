'use strict';

const env = require('../config/env');

async function fetchStrapi(endpoint) {
    const url = `${env.strapi.url}${endpoint}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${env.strapi.token}`,
            Accept: 'application/json',
        },
    });

    if (!response.ok) {
        const body = await response.text();

        throw new Error(
            `Strapi request failed (${response.status}): ${body}`
        );
    }

    return response.json();
}

async function fetchAll(collection) {
    const pageSize = 100;
    let page = 1;
    let all = [];

    while (true) {
        let endpoint =
            `/api/${collection}` +
            `?pagination[page]=${page}` +
            `&pagination[pageSize]=${pageSize}`;

        // Product media
        if (collection === 'products' || collection === 'gift-cards') {
            endpoint +=
                '&populate=image' +
                '&populate=gallery';
        }

        // Game Key ownership
        if (collection === 'game-keys') {
            endpoint +=
                '&populate[product][fields][0]=id' +
                '&populate[product][fields][1]=documentId' +
                '&populate[product][fields][2]=title' +
                '&populate[product][fields][3]=slug' +
                '&populate[giftCard][fields][0]=id' +
                '&populate[giftCard][fields][1]=documentId' +
                '&populate[giftCard][fields][2]=title' +
                '&populate[giftCard][fields][3]=slug';
        }

        const response = await fetchStrapi(endpoint);

        const items = response.data || [];

        all.push(...items);

        const pagination = response.meta?.pagination;

        if (!pagination || page >= pagination.pageCount) {
            break;
        }

        page++;
    }

    return all;
}

module.exports = {
    fetchStrapi,
    fetchAll,
};