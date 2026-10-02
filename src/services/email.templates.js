'use strict';

function buildOrderDeliveryEmail({
    orderNumber,
    deliveryEmail,
    items = [],
    subtotalAmount = null,
    discountAmount = 0,
    totalAmount,
    feeAmount = 0,
    currency = 'INR',
    paymentMethod = null,
    orderDate = null,
    frontendUrl = null,
    orderId = null,
}) {
    const formattedOrderDate =
        orderDate
            ? formatDate(orderDate)
            : formatDate(new Date());

    const resolvedSubtotal =
        subtotalAmount !== null
            ? Number(subtotalAmount)
            : Number(totalAmount) + Number(discountAmount || 0);

    const resolvedDiscount =
        Number(discountAmount) || 0;

    const orderUrl =
        frontendUrl && orderNumber
            ? `${frontendUrl.replace(/\/$/, '')}/orders/${encodeURIComponent(orderNumber)}`
            : null;

    const itemRows = items
        .map((item) => {
            const keys = Array.isArray(item.keys)
                ? item.keys
                : [];

            const keysHtml = keys
                .map(
                    (key) => `
                        <div style="
                            margin-top:10px;
                            padding:14px 16px;
                            background:#f8f7fc;
                            border:1px solid #e5e1f2;
                            border-radius:8px;
                            color:#171321;
                            font-family:Consolas,Monaco,'Courier New',monospace;
                            font-size:14px;
                            line-height:1.5;
                            font-weight:600;
                            letter-spacing:.2px;
                            word-break:break-all;
                        ">
                            ${escapeHtml(key)}
                        </div>
                    `
                )
                .join('');

            return `
    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        style="
            margin-bottom:16px;
            border:1px solid #e8e6ed;
            border-radius:12px;
            background:#ffffff;
        "
    >
        <tr>
            <td style="padding:18px;">

                <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                >
                    <tr>

                        ${item.image
                    ? `
                                    <td
                                        width="94"
                                        valign="top"
                                        style="
                                            width:94px;
                                            padding-right:14px;
                                        "
                                    >
                                        <img
                                            src="${escapeHtml(item.image)}"
                                            alt="${escapeHtml(item.title)}"
                                            width="80"
                                            height="110"
                                            style="
                                                display:block;
                                                width:80px;
                                                height:110px;
                                                object-fit:cover;
                                                border-radius:8px;
                                                border:1px solid #e8e6ed;
                                            "
                                        />
                                    </td>
                                `
                    : ''
                }

                        <td valign="top">

                            <div style="
                                font-size:16px;
                                line-height:24px;
                                font-weight:700;
                                color:#171321;
                            ">
                                ${escapeHtml(item.title)}
                            </div>

                            ${item.platform
                    ? `
                                        <div style="
                                            margin-top:4px;
                                            color:#77727f;
                                            font-size:12px;
                                            line-height:18px;
                                        ">
                                            ${escapeHtml(item.platform)}
                                            ${item.quantity
                        ? ` · Quantity ${Number(item.quantity) || 0}`
                        : ''
                    }
                                        </div>
                                    `
                    : `
                                        <div style="
                                            margin-top:4px;
                                            color:#77727f;
                                            font-size:12px;
                                            line-height:18px;
                                        ">
                                            Quantity ${Number(item.quantity) || 0}
                                        </div>
                                    `
                }

                        </td>

                    </tr>
                </table>

            </td>
        </tr>

        <tr>
            <td style="padding:0 18px 18px 18px;">

                <div style="
                    margin-bottom:6px;
                    color:#8a8592;
                    font-size:10px;
                    line-height:16px;
                    font-weight:700;
                    letter-spacing:1px;
                    text-transform:uppercase;
                ">
                    Your Key
                </div>

                ${keysHtml}

            </td>
        </tr>

    </table>
`;
        })
        .join('');

    const paymentHtml = paymentMethod
        ? `
            <tr>
                <td style="
                    padding:10px 0;
                    color:#77727f;
                    font-size:13px;
                ">
                    Payment Method
                </td>

                <td
                    align="right"
                    style="
                        padding:10px 0;
                        color:#171321;
                        font-size:13px;
                        font-weight:600;
                    "
                >
                    ${escapeHtml(paymentMethod)}
                </td>
            </tr>
        `
        : '';

    const orderButtonHtml = orderUrl
        ? `
            <table
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="margin:24px 0 8px 0;"
            >
                <tr>
                    <td align="center">

                        <a
                            href="${escapeHtml(orderUrl)}"
                            target="_blank"
                            style="
                                display:inline-block;
                                padding:13px 26px;
                                background:#4f46e5;
                                border-radius:8px;
                                color:#ffffff;
                                text-decoration:none;
                                font-size:14px;
                                line-height:20px;
                                font-weight:700;
                            "
                        >
                            View Your Order
                        </a>

                    </td>
                </tr>
            </table>
        `
        : '';

    return `
        <!DOCTYPE html>

        <html>
        <head>
            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >

            <title>
                Your Keyzoo Order Is Ready
            </title>
        </head>

        <body style="
            margin:0;
            padding:0;
            width:100%;
            background:#f3f4f6;
            font-family:Arial,Helvetica,sans-serif;
            color:#171321;
        ">

            <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="background:#f3f4f6;"
            >
                <tr>
                    <td
                        align="center"
                        style="padding:32px 16px;"
                    >

                        <!-- Main Container -->

                        <table
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            style="
                                max-width:620px;
                                background:#ffffff;
                                border-radius:14px;
                                overflow:hidden;
                                border:1px solid #e8e6ed;
                            "
                        >

                            <!-- Header -->

                            <tr>
                                <td
                                    style="
                                        padding:24px 28px;
                                        background:#ffffff;
                                        border-bottom:1px solid #eeeef2;
                                    "
                                >

                                    <table
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                    >
                                        <tr>
                                            <td>

                                                <div style="
                                                    font-size:21px;
                                                    line-height:28px;
                                                    font-weight:800;
                                                    color:#4f46e5;
                                                    letter-spacing:-.3px;
                                                ">
                                                    Keyzoo
                                                </div>

                                            </td>

                                            <td
                                                align="right"
                                                style="
                                                    color:#8a8592;
                                                    font-size:11px;
                                                "
                                            >
                                                DIGITAL DELIVERY
                                            </td>
                                        </tr>
                                    </table>

                                </td>
                            </tr>

                            <!-- Success Hero Banner -->

                            <tr>
                                <td
                                    style="
                                        padding:0;
                                        margin:0;
                                    "
                                >
                                    <img
                                        src="https://res.cloudinary.com/dblttl9bh/image/upload/v1790864106/keyzoo/products/gallery/o82kkgcdcrp0pryoakpa.png"
                                        alt="Your Keyzoo order is ready"
                                        width="620"
                                        style="
                                            display:block;
                                            width:100%;
                                            max-width:620px;
                                            height:auto;
                                            margin:0;
                                            padding:0;
                                            border:0;
                                            border-radius:0;
                                            outline:none;
                                            text-decoration:none;
                                        "
                                    />
                                </td>
                            </tr>

                            <!-- Greeting -->

                            <tr>
                                <td
                                    style="
                                        padding:24px 28px 22px 28px;
                                    "
                                >

                                    <div style="
                                        color:#4b4652;
                                        font-size:14px;
                                        line-height:22px;
                                    ">
                                        Hi ${escapeHtml(deliveryEmail)},
                                    </div>

                                    <div style="
                                        margin-top:8px;
                                        color:#6f6a76;
                                        font-size:14px;
                                        line-height:22px;
                                    ">
                                        Your payment was successful and
                                        your keys have been securely assigned
                                        to this order.
                                    </div>

                                </td>
                            </tr>

                            <!-- Order Information -->

                            <tr>
                                <td style="padding:0 28px 24px 28px;">

                                    <table
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        style="
                                            background:#f8f7fc;
                                            border:1px solid #ebe8f3;
                                            border-radius:10px;
                                        "
                                    >
                                        <tr>

                                            <!-- Order Number -->

                                            <td
                                                width="38%"
                                                valign="middle"
                                                style="
                                                    padding:16px 14px;
                                                "
                                            >

                                                <table
                                                    cellpadding="0"
                                                    cellspacing="0"
                                                >
                                                    <tr>

                                                        <td
                                                            valign="middle"
                                                            style="
                                                                width:42px;
                                                                padding-right:12px;
                                                            "
                                                        >
                                                            <div style="
                                                                width:40px;
                                                                height:40px;
                                                                background:#f0edff;
                                                                border-radius:50%;
                                                                text-align:center;
                                                                line-height:40px;
                                                            ">
                                                                <img
                                                                    src="https://res.cloudinary.com/dblttl9bh/image/upload/v1790865894/keyzoo/products/gallery/dqhiapujtbszgfzw0cxf.svg"
                                                                    alt="Order"
                                                                    width="20"
                                                                    height="20"
                                                                    style="
                                                                        display:inline-block;
                                                                        width:20px;
                                                                        height:20px;
                                                                        vertical-align:middle;
                                                                        border:0;
                                                                    "
                                                                />
                                                            </div>
                                                        </td>

                                                        <td valign="middle">

                                                            <div style="
                                                                color:#8a8592;
                                                                font-size:10px;
                                                                line-height:15px;
                                                                font-weight:700;
                                                                letter-spacing:1px;
                                                                text-transform:uppercase;
                                                            ">
                                                                Order Number
                                                            </div>

                                                            <div style="
                                                                margin-top:3px;
                                                                color:#171321;
                                                                font-family:Consolas,Monaco,'Courier New',monospace;
                                                                font-size:13px;
                                                                line-height:19px;
                                                                font-weight:700;
                                                                word-break:break-all;
                                                            ">
                                                                ${escapeHtml(orderNumber)}
                                                            </div>

                                                        </td>

                                                    </tr>
                                                </table>

                                            </td>

                                            <!-- Divider -->

                                            <td
                                                width="1"
                                                style="
                                                    width:1px;
                                                    padding:0;
                                                    background:#ddd9e8;
                                                    font-size:0;
                                                    line-height:0;
                                                "
                                            >
                                                &nbsp;
                                            </td>

                                            <!-- Order Date -->

                                            <td
                                                width="29%"
                                                valign="middle"
                                                style="
                                                    padding:16px 14px;
                                                "
                                            >

                                                <table
                                                    cellpadding="0"
                                                    cellspacing="0"
                                                >
                                                    <tr>

                                                        <td
                                                            valign="middle"
                                                            style="
                                                                width:42px;
                                                                padding-right:12px;
                                                            "
                                                        >
                                                            <div style="
                                                                width:40px;
                                                                height:40px;
                                                                background:#f0edff;
                                                                border-radius:50%;
                                                                text-align:center;
                                                                line-height:40px;
                                                            ">
                                                                <img
                                                                    src="https://res.cloudinary.com/dblttl9bh/image/upload/v1790865896/keyzoo/products/gallery/swz73qcsiuikbn1ouytn.svg"
                                                                    alt="Order date"
                                                                    width="20"
                                                                    height="20"
                                                                    style="
                                                                        display:inline-block;
                                                                        width:20px;
                                                                        height:20px;
                                                                        vertical-align:middle;
                                                                        border:0;
                                                                    "
                                                                />
                                                            </div>
                                                        </td>

                                                        <td valign="middle">

                                                            <div style="
                                                                color:#8a8592;
                                                                font-size:10px;
                                                                line-height:15px;
                                                                font-weight:700;
                                                                letter-spacing:1px;
                                                                text-transform:uppercase;
                                                            ">
                                                                Order Date
                                                            </div>

                                                            <div style="
                                                                margin-top:3px;
                                                                color:#33303a;
                                                                font-size:13px;
                                                                line-height:19px;
                                                                white-space:nowrap;
                                                            ">
                                                                ${escapeHtml(formattedOrderDate)}
                                                            </div>

                                                        </td>

                                                    </tr>
                                                </table>

                                            </td>

                                            ${paymentMethod
            ? `
                                                        <!-- Divider -->

                                                        <td
                                                            width="1"
                                                            style="
                                                                width:1px;
                                                                padding:0;
                                                                background:#ddd9e8;
                                                                font-size:0;
                                                                line-height:0;
                                                            "
                                                        >
                                                            &nbsp;
                                                        </td>

                                                        <!-- Payment Method -->

                                                        <td
                                                            width="33%"
                                                            valign="middle"
                                                            style="
                                                                padding:16px 14px;
                                                            "
                                                        >

                                                            <table
                                                                cellpadding="0"
                                                                cellspacing="0"
                                                            >
                                                                <tr>

                                                                    <td
                                                                        valign="middle"
                                                                        style="
                                                                            width:36px;
                                                                            padding-right:8px;
                                                                        "
                                                                    >
                                                                        <div style="
                                                                            width:40px;
                                                                            height:40px;
                                                                            background:#f0edff;
                                                                            border-radius:50%;
                                                                            text-align:center;
                                                                            line-height:40px;
                                                                        ">
                                                                            <img
                                                                                src="https://res.cloudinary.com/dblttl9bh/image/upload/v1790865898/keyzoo/products/gallery/grc75zukdqwavj7gdlwy.svg"
                                                                                alt="Payment method"
                                                                                width="20"
                                                                                height="20"
                                                                                style="
                                                                                    display:inline-block;
                                                                                    width:20px;
                                                                                    height:20px;
                                                                                    vertical-align:middle;
                                                                                    border:0;
                                                                                "
                                                                            />
                                                                        </div>
                                                                    </td>

                                                                    <td valign="middle">

                                                                        <div style="
                                                                            color:#8a8592;
                                                                            font-size:10px;
                                                                            line-height:15px;
                                                                            font-weight:700;
                                                                            letter-spacing:1px;
                                                                            text-transform:uppercase;
                                                                            white-space:nowrap;
                                                                        ">
                                                                            Payment Method
                                                                        </div>

                                                                        <div style="
                                                                            margin-top:3px;
                                                                            color:#33303a;
                                                                            font-size:13px;
                                                                            line-height:19px;
                                                                            font-weight:600;
                                                                        ">
                                                                            ${escapeHtml(paymentMethod)}
                                                                        </div>

                                                                    </td>

                                                                </tr>
                                                            </table>

                                                        </td>
                                                    `
            : ''
        }

                                        </tr>
                                    </table>

                                </td>
                            </tr>

                            <!-- View Order -->

                            <tr>
                                <td style="padding:0 28px;">

                                    ${orderButtonHtml}

                                </td>
                            </tr>

                            <!-- Products -->

                            <tr>
                                <td style="padding:22px 28px 0 28px;">

                                    <div style="
                                        margin-bottom:14px;
                                        color:#171321;
                                        font-size:15px;
                                        line-height:22px;
                                        font-weight:800;
                                    ">
                                        Your Products
                                    </div>

                                    ${itemRows}

                                </td>
                            </tr>

                            <!-- Order Summary -->

                            <tr>
                                <td style="padding:8px 28px 0 28px;">

                                    <div style="
                                        padding-top:22px;
                                        border-top:1px solid #eeeef2;
                                    ">

                                        <div style="
                                            margin-bottom:10px;
                                            color:#171321;
                                            font-size:15px;
                                            line-height:22px;
                                            font-weight:800;
                                        ">
                                            Order Summary
                                        </div>

                                        <table
                                            width="100%"
                                            cellpadding="0"
                                            cellspacing="0"
                                            style="font-size:13px;"
                                        >

                                            <tr>
                                                <td style="
                                                    padding:6px 0;
                                                    color:#77727f;
                                                ">
                                                    Subtotal
                                                </td>

                                                <td
                                                    align="right"
                                                    style="
                                                        padding:6px 0;
                                                        color:#33303a;
                                                    "
                                                >
                                                    ${formatMoney(resolvedSubtotal, currency)}
                                                </td>
                                            </tr>

                                            ${Number(feeAmount) > 0
                                                        ? `
                                                    <tr>
                                                        <td style="
                                                            padding:6px 0;
                                                            color:#77727f;
                                                        ">
                                                            Fee
                                                        </td>

                                                        <td
                                                            align="right"
                                                            style="
                                                                padding:6px 0;
                                                                color:#33303a;
                                                            "
                                                        >
                                                            ${formatMoney(feeAmount, currency)}
                                                        </td>
                                                    </tr>
                                                `
                                                        : ''
                                                    }

                                            ${resolvedDiscount > 0
                                                        ? `
                                                    <tr>
                                                        <td style="
                                                            padding:6px 0;
                                                            color:#77727f;
                                                        ">
                                                            Discount
                                                        </td>

                                                        <td
                                                            align="right"
                                                            style="
                                                                padding:6px 0;
                                                                color:#16a34a;
                                                                font-weight:600;
                                                            "
                                                        >
                                                            -${formatMoney(resolvedDiscount, currency)}
                                                        </td>
                                                    </tr>
                                                `
                                                        : ''
                                                    }

                                            <tr>
                                                <td
                                                    style="
                                                        padding:14px 0 6px 0;
                                                        border-top:1px solid #eeeef2;
                                                        color:#171321;
                                                        font-size:15px;
                                                        font-weight:800;
                                                    "
                                                >
                                                    Total
                                                </td>

                                                <td
                                                    align="right"
                                                    style="
                                                        padding:14px 0 6px 0;
                                                        border-top:1px solid #eeeef2;
                                                        color:#171321;
                                                        font-size:15px;
                                                        font-weight:800;
                                                    "
                                                >
                                                    ${formatMoney(totalAmount, currency)}
                                                </td>
                                            </tr>

                                        </table>

                                    </div>

                                </td>
                            </tr>

                            <!-- Delivery Notice -->

                            <tr>
                                <td style="
                                    padding:24px 28px 28px 28px;
                                ">

                                    <table
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        style="
                                            background:#f8f7fc;
                                            border-radius:10px;
                                        "
                                    >
                                        <tr>
                                            <td
                                                valign="middle"
                                                style="
                                                    padding:14px 16px;
                                                "
                                            >

                                                <table
                                                    width="100%"
                                                    cellpadding="0"
                                                    cellspacing="0"
                                                >
                                                    <tr>

                                                        <td
                                                            valign="middle"
                                                            style="
                                                                width:40px;
                                                                padding-right:12px;
                                                            "
                                                        >
                                                            <div style="
                                                                width:36px;
                                                                height:36px;
                                                                background:#f0edff;
                                                                border-radius:50%;
                                                                text-align:center;
                                                                line-height:36px;
                                                            ">
                                                                <img
                                                                    src="https://res.cloudinary.com/dblttl9bh/image/upload/v1790871628/keyzoo/products/gallery/smcb2qte3zpccd192sr0.svg"
                                                                    alt="Security"
                                                                    width="20"
                                                                    height="20"
                                                                    style="
                                                                        display:inline-block;
                                                                        width:20px;
                                                                        height:20px;
                                                                        vertical-align:middle;
                                                                        border:0;
                                                                    "
                                                                />
                                                            </div>
                                                        </td>

                                                        <td
                                                            valign="middle"
                                                            style="
                                                                color:#6f6a76;
                                                                font-size:12px;
                                                                line-height:19px;
                                                            "
                                                        >
                                                            Your keys are also available
                                                            from your Keyzoo account.
                                                            Please keep them secure and
                                                            do not share them publicly.
                                                        </td>

                                                    </tr>
                                                </table>

                                            </td>
                                        </tr>
                                    </table>

                                </td>
                            </tr>

                            <!-- Footer -->

                            <tr>
                                <td
                                    align="center"
                                    style="
                                        padding:22px 28px;
                                        background:#fafafa;
                                        border-top:1px solid #eeeef2;
                                    "
                                >

                                    <div style="
                                        color:#77727f;
                                        font-size:12px;
                                        line-height:19px;
                                    ">
                                        We hope to see you again.
                                    </div>

                                    <div style="
                                        margin-top:5px;
                                        color:#4f46e5;
                                        font-size:12px;
                                        line-height:19px;
                                        font-weight:700;
                                    ">
                                        Happy Gaming 🎮
                                    </div>

                                    <div style="
                                        margin-top:4px;
                                        color:#99949f;
                                        font-size:11px;
                                        line-height:18px;
                                    ">
                                        Team Keyzoo
                                    </div>

                                    <!-- Social Icons -->

                                    <table
                                        cellpadding="0"
                                        cellspacing="0"
                                        style="margin-top:14px;"
                                    >
                                        <tr>

                                            <td style="padding:0 5px;">
                                                <img
                                                    src="https://res.cloudinary.com/dblttl9bh/image/upload/v1790918876/keyzoo/products/gallery/p6z9khzaqp55fte2w7sc.svg"
                                                    alt="Social"
                                                    width="20"
                                                    height="20"
                                                    style="
                                                        display:block;
                                                        width:20px;
                                                        height:20px;
                                                        border:0;
                                                    "
                                                />
                                            </td>

                                            <td style="padding:0 5px;">
                                                <img
                                                    src="https://res.cloudinary.com/dblttl9bh/image/upload/v1790918878/keyzoo/products/gallery/fmyqf2zrvm0tfkrrklfk.svg"
                                                    alt="Social"
                                                    width="20"
                                                    height="20"
                                                    style="
                                                        display:block;
                                                        width:20px;
                                                        height:20px;
                                                        border:0;
                                                    "
                                                />
                                            </td>

                                            <td style="padding:0 5px;">
                                                <img
                                                    src="https://res.cloudinary.com/dblttl9bh/image/upload/v1790918880/keyzoo/products/gallery/ssijafrjuqfl9e8lh9p1.svg"
                                                    alt="Social"
                                                    width="20"
                                                    height="20"
                                                    style="
                                                        display:block;
                                                        width:20px;
                                                        height:20px;
                                                        border:0;
                                                    "
                                                />
                                            </td>

                                            <td style="padding:0 5px;">
                                                <img
                                                    src="https://res.cloudinary.com/dblttl9bh/image/upload/v1790918881/keyzoo/products/gallery/yxbmic2pkquqvcqqefgh.svg"
                                                    alt="Social"
                                                    width="20"
                                                    height="20"
                                                    style="
                                                        display:block;
                                                        width:20px;
                                                        height:20px;
                                                        border:0;
                                                    "
                                                />
                                            </td>

                                            <td style="padding:0 5px;">
                                                <img
                                                    src="https://res.cloudinary.com/dblttl9bh/image/upload/v1790918883/keyzoo/products/gallery/vvbcvxexz6eoy69vriht.svg"
                                                    alt="Social"
                                                    width="20"
                                                    height="20"
                                                    style="
                                                        display:block;
                                                        width:20px;
                                                        height:20px;
                                                        border:0;
                                                    "
                                                />
                                            </td>

                                        </tr>
                                    </table>

                                </td>
                            </tr>

                        </table>

                        <!-- Outside Footer -->

                        <div style="
                            max-width:620px;
                            padding:16px 20px 0 20px;
                            color:#aaa6af;
                            font-size:11px;
                            line-height:18px;
                            text-align:center;
                        ">
                            This is an automated delivery email from Keyzoo.
                            Please do not reply directly to this email.
                        </div>

                    </td>
                </tr>
            </table>

        </body>
        </html>
    `;
}

function formatMoney(amount, currency = 'INR') {
    const value = Number(amount) || 0;

    try {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    } catch {
        return `${currency} ${value.toFixed(2)}`;
    }
}

function formatDate(date) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return String(date);
    }

    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(parsedDate);
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

module.exports = {
    buildOrderDeliveryEmail,
};