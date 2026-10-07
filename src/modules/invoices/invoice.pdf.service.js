'use strict';

const PDFDocument = require('pdfkit');

const COLORS = {
    purple: '#7C3AED',
    purpleDark: '#5B21B6',
    purpleDeep: '#4C1D95',
    lavender: '#EDE9FE',
    lavenderSoft: '#F7F5FF',
    violetSoft: '#F3E8FF',

    black: '#18151D',
    text: '#3F3A46',
    muted: '#77717F',

    white: '#FFFFFF',
    background: '#FCFBFE',
    border: '#E7E3EB',

    success: '#16803C',
    successLight: '#ECFDF3',
};

const PAGE = {
    width: 595.28,
    height: 841.89,
    margin: 42,
};

const CONTENT_WIDTH =
    PAGE.width - PAGE.margin * 2;

/*
|--------------------------------------------------------------------------
| Formatting
|--------------------------------------------------------------------------
*/

function formatAmount(amount, currency = 'INR') {
    const value = Number(amount);

    if (!Number.isFinite(value)) {
        return '0.00';
    }

    const formattedValue = new Intl.NumberFormat(
        'en-IN',
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    ).format(value);

    return `${currency} ${formattedValue}`;
}

function formatDate(date) {
    const normalizedDate = new Date(date);

    if (Number.isNaN(normalizedDate.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat(
        'en-IN',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }
    ).format(normalizedDate);
}

function getPaymentMethodLabel(payment = {}) {
    const method = payment.method;
    const provider = payment.provider;

    if (method && provider) {
        return `${method.toUpperCase()} (${provider.toUpperCase()})`;
    }

    if (method) {
        return method.toUpperCase();
    }

    if (provider) {
        return provider.toUpperCase();
    }

    return '-';
}

/*
|--------------------------------------------------------------------------
| Safe fixed-position text
|--------------------------------------------------------------------------
*/

function fixedText(
    doc,
    text,
    x,
    y,
    width,
    height,
    options = {}
) {
    doc.text(
        String(text ?? ''),
        x,
        y,
        {
            width,
            height,
            lineBreak: false,
            ellipsis: true,
            ...options,
        }
    );
}

/*
|--------------------------------------------------------------------------
| Decorative artwork
|--------------------------------------------------------------------------
|
| This is intentionally drawn using PDFKit shapes instead of an external
| image. It keeps the invoice self-contained and gives Keyzoo its own
| visual identity.
|
*/

function drawLeaf(
    doc,
    x,
    y,
    scale,
    rotation,
    color
) {
    doc.save();

    doc.translate(x, y);
    doc.rotate(rotation);

    // Main botanical leaf
    doc
        .moveTo(0, 0)
        .bezierCurveTo(
            8 * scale,
            -17 * scale,
            25 * scale,
            -31 * scale,
            49 * scale,
            -21 * scale
        )
        .bezierCurveTo(
            39 * scale,
            -2 * scale,
            20 * scale,
            10 * scale,
            0,
            0
        )
        .closePath()
        .fill(color);

    // Soft inner highlight
    doc.save();

    doc
        .opacity(0.16)
        .moveTo(
            4 * scale,
            -2 * scale
        )
        .bezierCurveTo(
            14 * scale,
            -14 * scale,
            29 * scale,
            -23 * scale,
            42 * scale,
            -20 * scale
        )
        .bezierCurveTo(
            30 * scale,
            -10 * scale,
            17 * scale,
            -4 * scale,
            4 * scale,
            -2 * scale
        )
        .closePath()
        .fill('#FFFFFF');

    doc.restore();

    // Main central vein
    doc
        .save()
        .opacity(0.28)
        .lineWidth(
            Math.max(
                0.45,
                0.7 * scale
            )
        )
        .strokeColor('#FFFFFF');

    doc
        .moveTo(
            2 * scale,
            -1 * scale
        )
        .bezierCurveTo(
            15 * scale,
            -6 * scale,
            31 * scale,
            -14 * scale,
            46 * scale,
            -20 * scale
        )
        .stroke();

    doc.restore();

    // Small veins
    doc
        .save()
        .opacity(0.16)
        .lineWidth(
            Math.max(
                0.3,
                0.5 * scale
            )
        )
        .strokeColor('#FFFFFF');

    doc
        .moveTo(
            17 * scale,
            -7 * scale
        )
        .lineTo(
            22 * scale,
            -15 * scale
        )
        .stroke();

    doc
        .moveTo(
            25 * scale,
            -10 * scale
        )
        .lineTo(
            32 * scale,
            -18 * scale
        )
        .stroke();

    doc.restore();

    doc.restore();
}


function drawOutlineLeaf(
    doc,
    x,
    y,
    scale,
    rotation,
    color
) {
    doc.save();

    doc.translate(x, y);
    doc.rotate(rotation);

    // Outer botanical shape
    doc
        .moveTo(0, 0)
        .bezierCurveTo(
            8 * scale,
            -16 * scale,
            25 * scale,
            -28 * scale,
            48 * scale,
            -19 * scale
        )
        .bezierCurveTo(
            37 * scale,
            -2 * scale,
            18 * scale,
            9 * scale,
            0,
            0
        )
        .closePath()
        .lineWidth(
            Math.max(
                0.55,
                1 * scale
            )
        )
        .strokeColor(color)
        .stroke();

    // Central vein
    doc
        .save()
        .opacity(0.7)
        .lineWidth(
            Math.max(
                0.35,
                0.6 * scale
            )
        )
        .strokeColor(color);

    doc
        .moveTo(
            2 * scale,
            -1 * scale
        )
        .bezierCurveTo(
            15 * scale,
            -6 * scale,
            30 * scale,
            -13 * scale,
            45 * scale,
            -19 * scale
        )
        .stroke();

    doc.restore();

    doc.restore();
}

function drawDecorativeBackground(doc) {
    /*
    |--------------------------------------------------------------------------
    | White canvas
    |--------------------------------------------------------------------------
    */

    doc
        .rect(
            0,
            0,
            PAGE.width,
            PAGE.height
        )
        .fill(COLORS.white);

    /*
    |--------------------------------------------------------------------------
    | Very soft corner washes
    |--------------------------------------------------------------------------
    */

    doc.save();

    doc
        .fillOpacity(0.16)
        .circle(
            -8,
            12,
            105
        )
        .fill(COLORS.lavender);

    doc
        .fillOpacity(0.13)
        .circle(
            PAGE.width + 8,
            12,
            105
        )
        .fill(COLORS.lavender);

    doc.restore();

    /*
    |--------------------------------------------------------------------------
    | LEFT BOTANICAL VINE
    |--------------------------------------------------------------------------
    */

    doc.save();

    doc
        .lineWidth(1.35)
        .strokeColor('#8B5CF6')
        .opacity(0.62);

    doc
        .moveTo(
            -12,
            2
        )
        .bezierCurveTo(
            35,
            14,
            42,
            48,
            88,
            63
        )
        .bezierCurveTo(
            119,
            73,
            148,
            43,
            181,
            10
        )
        .stroke();

    doc
        .lineWidth(0.8)
        .strokeColor('#C4B5FD')
        .opacity(0.78);

    doc
        .moveTo(
            0,
            18
        )
        .bezierCurveTo(
            43,
            27,
            63,
            68,
            106,
            75
        )
        .bezierCurveTo(
            139,
            80,
            169,
            47,
            201,
            21
        )
        .stroke();

    doc.restore();

    /*
    |--------------------------------------------------------------------------
    | LEFT LEAF CLUSTER
    |--------------------------------------------------------------------------
    */

    drawLeaf(
        doc,
        3,
        30,
        1.42,
        -58,
        '#7C3AED'
    );

    drawLeaf(
        doc,
        34,
        10,
        1.12,
        -25,
        '#6D28D9'
    );

    drawLeaf(
        doc,
        56,
        51,
        1.18,
        -72,
        '#8B5CF6'
    );

    drawLeaf(
        doc,
        91,
        58,
        0.86,
        -32,
        '#A78BFA'
    );

    drawLeaf(
        doc,
        125,
        29,
        0.95,
        -65,
        '#7C3AED'
    );

    drawLeaf(
        doc,
        151,
        20,
        0.62,
        -25,
        '#C4B5FD'
    );

    drawOutlineLeaf(
        doc,
        74,
        73,
        0.74,
        -55,
        '#C4B5FD'
    );

    /*
    |--------------------------------------------------------------------------
    | LEFT FLOATING LEAVES
    |--------------------------------------------------------------------------
    */

    drawLeaf(
        doc,
        22,
        89,
        0.72,
        -73,
        '#DDD6FE'
    );

    drawLeaf(
        doc,
        116,
        88,
        0.62,
        -52,
        '#E9D5FF'
    );

    /*
    |--------------------------------------------------------------------------
    | RIGHT BOTANICAL VINE
    |--------------------------------------------------------------------------
    */

    doc.save();

    doc
        .lineWidth(1.35)
        .strokeColor('#8B5CF6')
        .opacity(0.62);

    doc
        .moveTo(
            PAGE.width + 12,
            2
        )
        .bezierCurveTo(
            PAGE.width - 35,
            14,
            PAGE.width - 42,
            48,
            PAGE.width - 88,
            63
        )
        .bezierCurveTo(
            PAGE.width - 119,
            73,
            PAGE.width - 148,
            43,
            PAGE.width - 181,
            10
        )
        .stroke();

    doc
        .lineWidth(0.8)
        .strokeColor('#C4B5FD')
        .opacity(0.78);

    doc
        .moveTo(
            PAGE.width,
            18
        )
        .bezierCurveTo(
            PAGE.width - 43,
            27,
            PAGE.width - 63,
            68,
            PAGE.width - 106,
            75
        )
        .bezierCurveTo(
            PAGE.width - 139,
            80,
            PAGE.width - 169,
            47,
            PAGE.width - 201,
            21
        )
        .stroke();

    doc.restore();

    /*
    |--------------------------------------------------------------------------
    | RIGHT LEAF CLUSTER
    |--------------------------------------------------------------------------
    */

    drawLeaf(
        doc,
        PAGE.width - 3,
        30,
        1.42,
        238,
        '#7C3AED'
    );

    drawLeaf(
        doc,
        PAGE.width - 34,
        10,
        1.12,
        205,
        '#6D28D9'
    );

    drawLeaf(
        doc,
        PAGE.width - 56,
        51,
        1.18,
        252,
        '#8B5CF6'
    );

    drawLeaf(
        doc,
        PAGE.width - 91,
        58,
        0.86,
        212,
        '#A78BFA'
    );

    drawLeaf(
        doc,
        PAGE.width - 125,
        29,
        0.95,
        245,
        '#7C3AED'
    );

    drawLeaf(
        doc,
        PAGE.width - 151,
        20,
        0.62,
        205,
        '#C4B5FD'
    );

    drawOutlineLeaf(
        doc,
        PAGE.width - 74,
        73,
        0.74,
        235,
        '#C4B5FD'
    );

    /*
    |--------------------------------------------------------------------------
    | RIGHT FLOATING LEAVES
    |--------------------------------------------------------------------------
    */

    drawLeaf(
        doc,
        PAGE.width - 22,
        89,
        0.72,
        253,
        '#DDD6FE'
    );

    drawLeaf(
        doc,
        PAGE.width - 116,
        88,
        0.62,
        232,
        '#E9D5FF'
    );

    /*
    |--------------------------------------------------------------------------
    | Small floating dots
    |--------------------------------------------------------------------------
    */

    doc.save();

    doc
        .fillOpacity(0.78)
        .circle(
            205,
            31,
            3
        )
        .fill(COLORS.purple);

    doc
        .fillOpacity(0.55)
        .circle(
            226,
            19,
            2
        )
        .fill('#A78BFA');

    doc
        .fillOpacity(0.72)
        .circle(
            248,
            47,
            1.7
        )
        .fill('#C4B5FD');

    doc
        .fillOpacity(0.78)
        .circle(
            PAGE.width - 205,
            31,
            3
        )
        .fill(COLORS.purple);

    doc
        .fillOpacity(0.55)
        .circle(
            PAGE.width - 226,
            19,
            2
        )
        .fill('#A78BFA');

    doc
        .fillOpacity(0.72)
        .circle(
            PAGE.width - 248,
            47,
            1.7
        )
        .fill('#C4B5FD');

    doc.restore();

    /*
    |--------------------------------------------------------------------------
    | Bottom-right botanical decoration
    |--------------------------------------------------------------------------
    */

    doc.save();

    doc
        .fillOpacity(0.10)
        .circle(
            PAGE.width + 10,
            PAGE.height + 8,
            105
        )
        .fill(COLORS.lavender);

    doc.restore();

    doc.save();

    doc
        .lineWidth(0.95)
        .strokeColor('#A78BFA')
        .opacity(0.48);

    doc
        .moveTo(
            PAGE.width + 4,
            PAGE.height - 8
        )
        .bezierCurveTo(
            PAGE.width - 34,
            PAGE.height - 16,
            PAGE.width - 58,
            PAGE.height - 47,
            PAGE.width - 98,
            PAGE.height - 67
        )
        .stroke();

    doc.restore();

    drawLeaf(
        doc,
        PAGE.width - 14,
        PAGE.height - 28,
        0.92,
        207,
        '#A78BFA'
    );

    drawLeaf(
        doc,
        PAGE.width - 49,
        PAGE.height - 44,
        0.68,
        164,
        '#C4B5FD'
    );

    drawLeaf(
        doc,
        PAGE.width - 77,
        PAGE.height - 20,
        0.56,
        224,
        '#DDD6FE'
    );

    drawOutlineLeaf(
        doc,
        PAGE.width - 102,
        PAGE.height - 38,
        0.55,
        184,
        '#C4B5FD'
    );

    /*
    |--------------------------------------------------------------------------
    | Bottom-right dots
    |--------------------------------------------------------------------------
    */

    doc.save();

    doc
        .fillOpacity(0.68)
        .circle(
            PAGE.width - 88,
            PAGE.height - 47,
            2.5
        )
        .fill(COLORS.purple);

    doc
        .fillOpacity(0.48)
        .circle(
            PAGE.width - 108,
            PAGE.height - 31,
            1.7
        )
        .fill('#A78BFA');

    doc
        .fillOpacity(0.55)
        .circle(
            PAGE.width - 68,
            PAGE.height - 27,
            1.5
        )
        .fill('#C4B5FD');

    doc.restore();
}

/*
|--------------------------------------------------------------------------
| Header
|--------------------------------------------------------------------------
*/

function drawHeader(doc, invoice) {
    const y = 73;

    // Logo
    doc
        .roundedRect(
            PAGE.margin,
            y,
            36,
            36,
            10
        )
        .fill(COLORS.purple);

    doc
        .font('Helvetica-Bold')
        .fontSize(18)
        .fillColor(COLORS.white);

    fixedText(
        doc,
        'K',
        PAGE.margin,
        y + 7,
        36,
        20,
        {
            align: 'center',
            ellipsis: false,
        }
    );

    // Brand
    doc
        .font('Helvetica-Bold')
        .fontSize(17)
        .fillColor(COLORS.black);

    fixedText(
        doc,
        'KEYZOO',
        PAGE.margin + 48,
        y + 1,
        170,
        20
    );

    doc
        .font('Helvetica')
        .fontSize(7.5)
        .fillColor(COLORS.muted);

    fixedText(
        doc,
        'DIGITAL GAMES & GIFT CARDS',
        PAGE.margin + 48,
        y + 23,
        190,
        10
    );

    // Invoice
    doc
        .font('Helvetica-Bold')
        .fontSize(25)
        .fillColor(COLORS.black);

    fixedText(
        doc,
        'INVOICE',
        350,
        y - 1,
        203,
        29,
        {
            align: 'right',
            ellipsis: false,
        }
    );

    doc
        .font('Helvetica')
        .fontSize(7.5)
        .fillColor(COLORS.muted);

    fixedText(
        doc,
        `# ${invoice.invoiceNumber}`,
        350,
        y + 28,
        203,
        10,
        {
            align: 'right',
        }
    );

    fixedText(
        doc,
        formatDate(invoice.invoiceDate),
        350,
        y + 40,
        203,
        10,
        {
            align: 'right',
        }
    );

    // Elegant separator
    doc
        .moveTo(
            PAGE.margin,
            128
        )
        .lineTo(
            PAGE.width - PAGE.margin,
            128
        )
        .lineWidth(0.8)
        .strokeColor(COLORS.border)
        .stroke();

    doc
        .moveTo(
            PAGE.margin,
            128
        )
        .lineTo(
            PAGE.margin + 92,
            128
        )
        .lineWidth(2.5)
        .strokeColor(COLORS.purple)
        .stroke();
}

/*
|--------------------------------------------------------------------------
| Customer / order information
|--------------------------------------------------------------------------
*/

function drawMetaSection(doc, invoice) {
    const y = 147;

    const leftX = PAGE.margin;
    const rightX = 330;

    doc
        .font('Helvetica-Bold')
        .fontSize(7)
        .fillColor(COLORS.purple);

    fixedText(
        doc,
        'BILLED TO',
        leftX,
        y,
        200,
        9
    );

    fixedText(
        doc,
        'ORDER DETAILS',
        rightX,
        y,
        200,
        9
    );

    doc
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .fillColor(COLORS.black);

    fixedText(
        doc,
        invoice.customer?.email || '-',
        leftX,
        y + 17,
        240,
        13
    );

    doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor(COLORS.muted);

    fixedText(
        doc,
        'Customer email',
        leftX,
        y + 32,
        150,
        9
    );

    doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(COLORS.text);

    fixedText(
        doc,
        `Order  ${invoice.orderNumber}`,
        rightX,
        y + 17,
        220,
        11
    );

    fixedText(
        doc,
        `Payment  ${getPaymentMethodLabel(
            invoice.payment
        )}`,
        rightX,
        y + 32,
        220,
        11
    );

    const status =
        typeof invoice.payment?.status === 'string'
            ? invoice.payment.status.toLowerCase()
            : '';

    const isPaid =
        status === 'paid';

    const badgeWidth =
        isPaid ? 88 : 78;

    doc
        .roundedRect(
            rightX,
            y + 48,
            badgeWidth,
            18,
            9
        )
        .fill(
            isPaid
                ? COLORS.successLight
                : '#FDF2F2'
        );

    doc
        .font('Helvetica-Bold')
        .fontSize(6.5)
        .fillColor(
            isPaid
                ? COLORS.success
                : '#B42318'
        );

    fixedText(
        doc,
        isPaid
            ? 'PAYMENT PAID'
            : status
                ? status.toUpperCase()
                : 'PENDING',
        rightX,
        y + 54,
        badgeWidth,
        8,
        {
            align: 'center',
            ellipsis: false,
        }
    );

    doc
        .moveTo(
            PAGE.margin,
            y + 79
        )
        .lineTo(
            PAGE.width - PAGE.margin,
            y + 79
        )
        .lineWidth(0.7)
        .strokeColor(COLORS.border)
        .stroke();
}

/*
|--------------------------------------------------------------------------
| Purchase table
|--------------------------------------------------------------------------
*/

function drawItems(doc, invoice) {
    const headingY = 247;
    const tableY = 272;

    doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor(COLORS.black);

    fixedText(
        doc,
        'PURCHASE DETAILS',
        PAGE.margin,
        headingY,
        105,
        10
    );

    doc
        .moveTo(
            PAGE.margin + 105,
            headingY + 5
        )
        .lineTo(
            PAGE.width - PAGE.margin,
            headingY + 5
        )
        .lineWidth(0.7)
        .strokeColor(COLORS.border)
        .stroke();

    const productX =
        PAGE.margin + 12;

    const typeX = 315;
    const qtyX = 392;
    const unitX = 435;
    const totalX = 493;

    // Header
    doc
        .roundedRect(
            PAGE.margin,
            tableY,
            CONTENT_WIDTH,
            28,
            6
        )
        .fill(COLORS.black);

    doc
        .font('Helvetica-Bold')
        .fontSize(7)
        .fillColor(COLORS.white);

    fixedText(
        doc,
        'PRODUCT',
        productX,
        tableY + 10,
        100,
        8
    );

    fixedText(
        doc,
        'TYPE',
        typeX,
        tableY + 10,
        60,
        8
    );

    fixedText(
        doc,
        'QTY',
        qtyX,
        tableY + 10,
        25,
        8,
        {
            align: 'center',
        }
    );

    fixedText(
        doc,
        'UNIT PRICE',
        unitX,
        tableY + 10,
        55,
        8,
        {
            align: 'right',
        }
    );

    fixedText(
        doc,
        'TOTAL',
        totalX,
        tableY + 10,
        45,
        8,
        {
            align: 'right',
        }
    );

    let currentY =
        tableY + 28;

    invoice.items.forEach(
        (item, index) => {
            const title =
                item.title ||
                'Digital Product';

            const details = [
                item.region
                    ? item.region
                    : null,

                item.var_title
                    ? item.var_title
                    : null,
            ]
                .filter(Boolean)
                .join('  /  ');

            const rowHeight =
                details
                    ? 57
                    : 42;

            if (index % 2 === 0) {
                doc
                    .rect(
                        PAGE.margin,
                        currentY,
                        CONTENT_WIDTH,
                        rowHeight
                    )
                    .fill(COLORS.background);
            }

            doc
                .font('Helvetica-Bold')
                .fontSize(8.5)
                .fillColor(COLORS.black);

            fixedText(
                doc,
                title,
                productX,
                currentY + 10,
                285,
                14
            );

            if (details) {
                doc
                    .font('Helvetica')
                    .fontSize(7)
                    .fillColor(COLORS.muted);

                fixedText(
                    doc,
                    details,
                    productX,
                    currentY + 27,
                    285,
                    10
                );
            }

            doc
                .font('Helvetica')
                .fontSize(7.5)
                .fillColor(COLORS.text);

            fixedText(
                doc,
                item.type === 'gift-card'
                    ? 'Gift Card'
                    : 'Game',
                typeX,
                currentY + 15,
                60,
                10
            );

            fixedText(
                doc,
                String(item.quantity),
                qtyX,
                currentY + 15,
                25,
                10,
                {
                    align: 'center',
                    ellipsis: false,
                }
            );

            fixedText(
                doc,
                formatAmount(
                    item.unitPrice,
                    invoice.currency
                ),
                unitX,
                currentY + 15,
                55,
                10,
                {
                    align: 'right',
                }
            );

            doc
                .font('Helvetica-Bold')
                .fillColor(COLORS.black);

            fixedText(
                doc,
                formatAmount(
                    item.subtotal,
                    invoice.currency
                ),
                totalX,
                currentY + 15,
                45,
                10,
                {
                    align: 'right',
                }
            );

            doc
                .moveTo(
                    PAGE.margin,
                    currentY + rowHeight
                )
                .lineTo(
                    PAGE.width - PAGE.margin,
                    currentY + rowHeight
                )
                .lineWidth(0.6)
                .strokeColor(COLORS.border)
                .stroke();

            currentY += rowHeight;
        }
    );

    return currentY;
}

/*
|--------------------------------------------------------------------------
| Totals
|--------------------------------------------------------------------------
*/

function drawSummary(doc, invoice, startY) {
    const top =
        startY + 22;

    const summaryWidth = 235;

    const summaryX =
        PAGE.width -
        PAGE.margin -
        summaryWidth;

    const hasDiscount =
        Number(invoice.discountAmount) > 0;

    const height =
        hasDiscount
            ? 116
            : 91;

    doc
        .roundedRect(
            summaryX,
            top,
            summaryWidth,
            height,
            8
        )
        .fillAndStroke(
            COLORS.white,
            COLORS.border
        );

    // Purple side accent
    doc
        .roundedRect(
            summaryX,
            top,
            4,
            height,
            2
        )
        .fill(COLORS.purple);

    const labelX =
        summaryX + 15;

    const valueX =
        summaryX + 105;

    const valueWidth =
        summaryWidth - 120;

    doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(COLORS.muted);

    fixedText(
        doc,
        'Subtotal',
        labelX,
        top + 16,
        80,
        10
    );

    fixedText(
        doc,
        formatAmount(
            invoice.subtotalAmount,
            invoice.currency
        ),
        valueX,
        top + 16,
        valueWidth,
        10,
        {
            align: 'right',
        }
    );

    let currentY =
        top + 39;

    if (hasDiscount) {
        fixedText(
            doc,
            'Discount',
            labelX,
            currentY,
            80,
            10
        );

        doc.fillColor(COLORS.success);

        fixedText(
            doc,
            `-${formatAmount(
                invoice.discountAmount,
                invoice.currency
            )}`,
            valueX,
            currentY,
            valueWidth,
            10,
            {
                align: 'right',
            }
        );

        currentY += 23;
    }

    doc
        .moveTo(
            labelX,
            currentY
        )
        .lineTo(
            summaryX +
            summaryWidth -
            15,
            currentY
        )
        .lineWidth(0.7)
        .strokeColor(COLORS.border)
        .stroke();

    currentY += 14;

    doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .fillColor(COLORS.black);

    fixedText(
        doc,
        'TOTAL PAID',
        labelX,
        currentY,
        80,
        11
    );

    doc
        .fontSize(12)
        .fillColor(COLORS.purple);

    fixedText(
        doc,
        formatAmount(
            invoice.totalAmount,
            invoice.currency
        ),
        valueX,
        currentY - 2,
        valueWidth,
        14,
        {
            align: 'right',
        }
    );

    return top + height;
}

/*
|--------------------------------------------------------------------------
| Digital purchase note
|--------------------------------------------------------------------------
*/

function drawNote(doc, y) {
    // Small purple vertical marker
    doc
        .roundedRect(
            PAGE.margin,
            y + 1,
            3,
            14,
            1.5
        )
        .fill(COLORS.purple);

    doc
        .font('Helvetica-Bold')
        .fontSize(7)
        .fillColor(COLORS.text);

    fixedText(
        doc,
        'DIGITAL PURCHASE',
        PAGE.margin + 12,
        y,
        100,
        9
    );

    doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor(COLORS.muted);

    fixedText(
        doc,
        'Keys are delivered electronically.',
        PAGE.margin + 12,
        y + 12,
        220,
        9
    );
}

/*
|--------------------------------------------------------------------------
| Footer
|--------------------------------------------------------------------------
*/

function drawFooter(doc) {
    const footerY = 770;

    doc
        .moveTo(
            PAGE.margin,
            footerY
        )
        .lineTo(
            PAGE.width - PAGE.margin,
            footerY
        )
        .lineWidth(0.7)
        .strokeColor(COLORS.border)
        .stroke();

    doc
        .font('Helvetica-Bold')
        .fontSize(7.5)
        .fillColor(COLORS.black);

    fixedText(
        doc,
        'KEYZOO',
        PAGE.margin,
        footerY + 13,
        35,
        9
    );

    doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor(COLORS.muted);

    fixedText(
        doc,
        'Digital Games & Gift Cards',
        PAGE.margin + 38,
        footerY + 13,
        180,
        9
    );

    fixedText(
        doc,
        'keyzoo.shop',
        PAGE.width - PAGE.margin - 70,
        footerY + 13,
        70,
        9,
        {
            align: 'right',
        }
    );
}

/*
|--------------------------------------------------------------------------
| Generate PDF
|--------------------------------------------------------------------------
*/

function generateInvoicePdf(invoice) {
    return new Promise(
        (resolve, reject) => {
            if (!invoice) {
                return reject(
                    new Error(
                        'Invoice data is required.'
                    )
                );
            }

            const doc =
                new PDFDocument({
                    size: 'A4',
                    margin: 0,

                    info: {
                        Title:
                            `Keyzoo Invoice ${invoice.invoiceNumber}`,

                        Author:
                            'Keyzoo',

                        Subject:
                            `Invoice ${invoice.invoiceNumber}`,
                    },
                });

            const chunks = [];

            doc.on(
                'data',
                (chunk) => {
                    chunks.push(chunk);
                }
            );

            doc.on(
                'end',
                () => {
                    resolve(
                        Buffer.concat(chunks)
                    );
                }
            );

            doc.on(
                'error',
                reject
            );

            try {
                /*
                |--------------------------------------------------------------------------
                | One single A4 page
                |--------------------------------------------------------------------------
                */

                drawDecorativeBackground(doc);

                drawHeader(
                    doc,
                    invoice
                );

                drawMetaSection(
                    doc,
                    invoice
                );

                const itemsEndY =
                    drawItems(
                        doc,
                        invoice
                    );

                const summaryEndY =
                    drawSummary(
                        doc,
                        invoice,
                        itemsEndY
                    );

                drawNote(
                    doc,
                    summaryEndY + 18
                );

                drawFooter(doc);

                doc.end();
            } catch (error) {
                reject(error);
            }
        }
    );
}

module.exports = {
    generateInvoicePdf,
};