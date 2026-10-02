'use strict';

function buildWelcomeEmail({
    name,
    email,
    frontendUrl = null,
}) {
    const displayName =
        typeof name === 'string' && name.trim()
            ? name.trim()
            : email;

    const accountUrl =
        frontendUrl
            ? `${frontendUrl.replace(/\/$/, '')}/account`
            : null;

    const accountButtonHtml = accountUrl
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
                            href="${escapeHtml(accountUrl)}"
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
                            Go to My Account
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
                Welcome to Keyzoo
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
                                                WELCOME
                                            </td>

                                        </tr>
                                    </table>

                                </td>
                            </tr>


                            <!-- Welcome Hero -->

                            <tr>
                                <td
                                    style="
                                        padding:0;
                                        margin:0;
                                    "
                                >

                                    <img
                                        src="https://res.cloudinary.com/dblttl9bh/image/upload/v1790864106/keyzoo/products/gallery/o82kkgcdcrp0pryoakpa.png"
                                        alt="Welcome to Keyzoo"
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
                                        Hi ${escapeHtml(displayName)},
                                    </div>

                                    <div style="
                                        margin-top:8px;
                                        color:#171321;
                                        font-size:22px;
                                        line-height:30px;
                                        font-weight:800;
                                        letter-spacing:-.3px;
                                    ">
                                        Welcome to Keyzoo!
                                    </div>

                                    <div style="
                                        margin-top:8px;
                                        color:#6f6a76;
                                        font-size:14px;
                                        line-height:22px;
                                    ">
                                        Your Keyzoo account has been created
                                        successfully. You're now ready to
                                        explore digital games, gift cards,
                                        and more.
                                    </div>

                                </td>
                            </tr>


                            <!-- Account Information -->

                            <tr>
                                <td style="padding:0 28px 8px 28px;">

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

                                            <td
                                                valign="middle"
                                                style="
                                                    padding:16px;
                                                "
                                            >

                                                <div style="
                                                    color:#8a8592;
                                                    font-size:10px;
                                                    line-height:15px;
                                                    font-weight:700;
                                                    letter-spacing:1px;
                                                    text-transform:uppercase;
                                                ">
                                                    Account Email
                                                </div>

                                                <div style="
                                                    margin-top:4px;
                                                    color:#171321;
                                                    font-size:14px;
                                                    line-height:20px;
                                                    font-weight:600;
                                                    word-break:break-all;
                                                ">
                                                    ${escapeHtml(email)}
                                                </div>

                                            </td>

                                        </tr>
                                    </table>

                                </td>
                            </tr>


                            <!-- Account Button -->

                            <tr>
                                <td style="padding:0 28px;">

                                    ${accountButtonHtml}

                                </td>
                            </tr>


                            <!-- Getting Started -->

                            <tr>
                                <td style="padding:22px 28px 0 28px;">

                                    <div style="
                                        margin-bottom:10px;
                                        color:#171321;
                                        font-size:15px;
                                        line-height:22px;
                                        font-weight:800;
                                    ">
                                        You're all set
                                    </div>

                                    <div style="
                                        color:#6f6a76;
                                        font-size:13px;
                                        line-height:21px;
                                    ">
                                        You can now manage your account,
                                        purchase digital products, and access
                                        your orders directly from Keyzoo.
                                    </div>

                                </td>
                            </tr>


                            <!-- Security Notice -->

                            <tr>
                                <td
                                    style="
                                        padding:24px 28px 28px 28px;
                                    "
                                >

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

                                                                <div style="
                                                                    color:#4f46e5;
                                                                    font-size:18px;
                                                                    line-height:36px;
                                                                    font-weight:700;
                                                                ">
                                                                    ✓
                                                                </div>

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
                                                            If you did not create
                                                            this Keyzoo account,
                                                            please contact our
                                                            support team immediately.
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
                                        Welcome to the Keyzoo community.
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
                            This is an automated email from Keyzoo.
                            Please do not reply directly to this email.
                        </div>

                    </td>
                </tr>
            </table>

        </body>
        </html>
    `;
}

function buildVerificationEmail({
    name,
    email,
    verificationUrl,
    expiresIn = '30 minutes',
}) {
    const displayName =
        typeof name === 'string' && name.trim()
            ? name.trim()
            : email;

    const verifyButtonHtml = verificationUrl
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
                            href="${escapeHtml(verificationUrl)}"
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
                            Verify Email Address
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
                Verify Your Keyzoo Email
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
                                                EMAIL VERIFICATION
                                            </td>

                                        </tr>
                                    </table>

                                </td>
                            </tr>


                            <!-- Verification Hero -->

                            <tr>
                                <td
                                    style="
                                        padding:0;
                                        margin:0;
                                    "
                                >

                                    <img
                                        src="https://res.cloudinary.com/dblttl9bh/image/upload/v1790864106/keyzoo/products/gallery/o82kkgcdcrp0pryoakpa.png"
                                        alt="Verify your Keyzoo email"
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
                                        Hi ${escapeHtml(displayName)},
                                    </div>

                                    <div style="
                                        margin-top:8px;
                                        color:#171321;
                                        font-size:22px;
                                        line-height:30px;
                                        font-weight:800;
                                        letter-spacing:-.3px;
                                    ">
                                        Verify your email address
                                    </div>

                                    <div style="
                                        margin-top:8px;
                                        color:#6f6a76;
                                        font-size:14px;
                                        line-height:22px;
                                    ">
                                        Please verify your email address to
                                        finish setting up your Keyzoo account.
                                        This helps keep your account secure.
                                    </div>

                                </td>
                            </tr>


                            <!-- Email Information -->

                            <tr>
                                <td style="padding:0 28px 8px 28px;">

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

                                            <td
                                                valign="middle"
                                                style="
                                                    padding:16px;
                                                "
                                            >

                                                <div style="
                                                    color:#8a8592;
                                                    font-size:10px;
                                                    line-height:15px;
                                                    font-weight:700;
                                                    letter-spacing:1px;
                                                    text-transform:uppercase;
                                                ">
                                                    Email Address
                                                </div>

                                                <div style="
                                                    margin-top:4px;
                                                    color:#171321;
                                                    font-size:14px;
                                                    line-height:20px;
                                                    font-weight:600;
                                                    word-break:break-all;
                                                ">
                                                    ${escapeHtml(email)}
                                                </div>

                                            </td>

                                        </tr>
                                    </table>

                                </td>
                            </tr>


                            <!-- Verify Button -->

                            <tr>
                                <td style="padding:0 28px;">

                                    ${verifyButtonHtml}

                                </td>
                            </tr>


                            <!-- Expiration -->

                            <tr>
                                <td style="padding:16px 28px 0 28px;">

                                    <div style="
                                        color:#77727f;
                                        font-size:12px;
                                        line-height:19px;
                                        text-align:center;
                                    ">
                                        This verification link expires in
                                        <strong style="color:#4b4652;">
                                            ${escapeHtml(expiresIn)}
                                        </strong>.
                                    </div>

                                </td>
                            </tr>


                            <!-- Security Notice -->

                            <tr>
                                <td
                                    style="
                                        padding:24px 28px 28px 28px;
                                    "
                                >

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

                                                                <div style="
                                                                    color:#4f46e5;
                                                                    font-size:18px;
                                                                    line-height:36px;
                                                                    font-weight:700;
                                                                ">
                                                                    ✓
                                                                </div>

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
                                                            If you did not request
                                                            this verification,
                                                            you can safely ignore
                                                            this email.
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
                                        Thanks for choosing Keyzoo.
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
                            This is an automated email from Keyzoo.
                            Please do not reply directly to this email.
                        </div>

                    </td>
                </tr>
            </table>

        </body>
        </html>
    `;
}

function buildOtpEmail({
    name,
    email,
    otp,
    expiresIn = '10 minutes',
}) {
    const displayName =
        typeof name === 'string' && name.trim()
            ? name.trim()
            : email;

    const safeOtp = String(otp ?? '').trim();

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
                Your Keyzoo Verification Code
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
                                                SECURITY CODE
                                            </td>

                                        </tr>
                                    </table>

                                </td>
                            </tr>


                            <!-- OTP Hero -->

                            <tr>
                                <td
                                    style="
                                        padding:0;
                                        margin:0;
                                    "
                                >

                                    <img
                                        src="https://res.cloudinary.com/dblttl9bh/image/upload/v1790864106/keyzoo/products/gallery/o82kkgcdcrp0pryoakpa.png"
                                        alt="Your Keyzoo security code"
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
                                        Hi ${escapeHtml(displayName)},
                                    </div>

                                    <div style="
                                        margin-top:8px;
                                        color:#171321;
                                        font-size:22px;
                                        line-height:30px;
                                        font-weight:800;
                                        letter-spacing:-.3px;
                                    ">
                                        Your verification code
                                    </div>

                                    <div style="
                                        margin-top:8px;
                                        color:#6f6a76;
                                        font-size:14px;
                                        line-height:22px;
                                    ">
                                        Use the verification code below to
                                        continue with your Keyzoo account.
                                    </div>

                                </td>
                            </tr>


                            <!-- OTP Card -->

                            <tr>
                                <td style="padding:0 28px;">

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

                                            <td
                                                align="center"
                                                style="
                                                    padding:24px 16px;
                                                "
                                            >

                                                <div style="
                                                    color:#8a8592;
                                                    font-size:10px;
                                                    line-height:15px;
                                                    font-weight:700;
                                                    letter-spacing:1px;
                                                    text-transform:uppercase;
                                                ">
                                                    Verification Code
                                                </div>

                                                <div style="
                                                    margin-top:10px;
                                                    color:#4f46e5;
                                                    font-family:Consolas,Monaco,'Courier New',monospace;
                                                    font-size:32px;
                                                    line-height:40px;
                                                    font-weight:800;
                                                    letter-spacing:7px;
                                                ">
                                                    ${escapeHtml(safeOtp)}
                                                </div>

                                            </td>

                                        </tr>
                                    </table>

                                </td>
                            </tr>


                            <!-- Expiration -->

                            <tr>
                                <td style="padding:16px 28px 0 28px;">

                                    <div style="
                                        color:#77727f;
                                        font-size:12px;
                                        line-height:19px;
                                        text-align:center;
                                    ">
                                        This code expires in
                                        <strong style="color:#4b4652;">
                                            ${escapeHtml(expiresIn)}
                                        </strong>.
                                    </div>

                                </td>
                            </tr>


                            <!-- Email Information -->

                            <tr>
                                <td style="padding:20px 28px 0 28px;">

                                    <table
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        style="
                                            background:#ffffff;
                                            border:1px solid #e8e6ed;
                                            border-radius:10px;
                                        "
                                    >
                                        <tr>

                                            <td
                                                style="
                                                    padding:14px 16px;
                                                "
                                            >

                                                <div style="
                                                    color:#8a8592;
                                                    font-size:10px;
                                                    line-height:15px;
                                                    font-weight:700;
                                                    letter-spacing:1px;
                                                    text-transform:uppercase;
                                                ">
                                                    Account Email
                                                </div>

                                                <div style="
                                                    margin-top:4px;
                                                    color:#171321;
                                                    font-size:13px;
                                                    line-height:19px;
                                                    font-weight:600;
                                                    word-break:break-all;
                                                ">
                                                    ${escapeHtml(email)}
                                                </div>

                                            </td>

                                        </tr>
                                    </table>

                                </td>
                            </tr>


                            <!-- Security Notice -->

                            <tr>
                                <td
                                    style="
                                        padding:24px 28px 28px 28px;
                                    "
                                >

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

                                                                <div style="
                                                                    color:#4f46e5;
                                                                    font-size:18px;
                                                                    line-height:36px;
                                                                    font-weight:700;
                                                                ">
                                                                    ✓
                                                                </div>

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
                                                            If you did not request
                                                            this code, do not share
                                                            it with anyone. You can
                                                            safely ignore this email.
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
                                        Your account security matters to us.
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
                            This is an automated email from Keyzoo.
                            Please do not reply directly to this email.
                        </div>

                    </td>
                </tr>
            </table>

        </body>
        </html>
    `;
}

function buildPasswordResetEmail({
    name,
    email,
    resetUrl,
    expiresIn = '30 minutes',
}) {
    const displayName =
        typeof name === 'string' && name.trim()
            ? name.trim()
            : email;

    const resetButtonHtml = resetUrl
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
                            href="${escapeHtml(resetUrl)}"
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
                            Reset My Password
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
                Reset Your Keyzoo Password
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
                                                PASSWORD RESET
                                            </td>

                                        </tr>
                                    </table>

                                </td>
                            </tr>


                            <!-- Reset Hero -->

                            <tr>
                                <td
                                    style="
                                        padding:0;
                                        margin:0;
                                    "
                                >

                                    <img
                                        src="https://res.cloudinary.com/dblttl9bh/image/upload/v1790864106/keyzoo/products/gallery/o82kkgcdcrp0pryoakpa.png"
                                        alt="Reset your Keyzoo password"
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
                                        Hi ${escapeHtml(displayName)},
                                    </div>

                                    <div style="
                                        margin-top:8px;
                                        color:#171321;
                                        font-size:22px;
                                        line-height:30px;
                                        font-weight:800;
                                        letter-spacing:-.3px;
                                    ">
                                        Reset your password
                                    </div>

                                    <div style="
                                        margin-top:8px;
                                        color:#6f6a76;
                                        font-size:14px;
                                        line-height:22px;
                                    ">
                                        We received a request to reset the
                                        password for your Keyzoo account.
                                        Click the button below to create a
                                        new password.
                                    </div>

                                </td>
                            </tr>


                            <!-- Account Information -->

                            <tr>
                                <td style="padding:0 28px 8px 28px;">

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

                                            <td
                                                valign="middle"
                                                style="
                                                    padding:16px;
                                                "
                                            >

                                                <div style="
                                                    color:#8a8592;
                                                    font-size:10px;
                                                    line-height:15px;
                                                    font-weight:700;
                                                    letter-spacing:1px;
                                                    text-transform:uppercase;
                                                ">
                                                    Account Email
                                                </div>

                                                <div style="
                                                    margin-top:4px;
                                                    color:#171321;
                                                    font-size:14px;
                                                    line-height:20px;
                                                    font-weight:600;
                                                    word-break:break-all;
                                                ">
                                                    ${escapeHtml(email)}
                                                </div>

                                            </td>

                                        </tr>
                                    </table>

                                </td>
                            </tr>


                            <!-- Reset Button -->

                            <tr>
                                <td style="padding:0 28px;">

                                    ${resetButtonHtml}

                                </td>
                            </tr>


                            <!-- Expiration -->

                            <tr>
                                <td style="padding:16px 28px 0 28px;">

                                    <div style="
                                        color:#77727f;
                                        font-size:12px;
                                        line-height:19px;
                                        text-align:center;
                                    ">
                                        This password reset link expires in
                                        <strong style="color:#4b4652;">
                                            ${escapeHtml(expiresIn)}
                                        </strong>.
                                    </div>

                                </td>
                            </tr>


                            <!-- Security Notice -->

                            <tr>
                                <td
                                    style="
                                        padding:24px 28px 28px 28px;
                                    "
                                >

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

                                                                <div style="
                                                                    color:#4f46e5;
                                                                    font-size:18px;
                                                                    line-height:36px;
                                                                    font-weight:700;
                                                                ">
                                                                    ✓
                                                                </div>

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
                                                            If you did not request
                                                            a password reset, you
                                                            can safely ignore this
                                                            email. Your password
                                                            will remain unchanged.
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
                                        Your account security matters to us.
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
                            This is an automated email from Keyzoo.
                            Please do not reply directly to this email.
                        </div>

                    </td>
                </tr>
            </table>

        </body>
        </html>
    `;
}

function buildPasswordChangedEmail({
    name,
    email,
    changedAt = null,
    frontendUrl = null,
}) {
    const safeName = escapeHtml(name || 'there');
    const safeEmail = escapeHtml(email || '');
    const safeChangedAt = escapeHtml(
        changedAt
            ? String(changedAt)
            : new Date().toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
            })
    );

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >
    <title>Password Changed</title>
</head>

<body style="
    margin:0;
    padding:0;
    background:#f5f5f7;
    font-family:Arial,Helvetica,sans-serif;
    color:#171717;
">

    <div style="
        width:100%;
        padding:32px 16px;
        box-sizing:border-box;
    ">

        <div style="
            max-width:620px;
            margin:0 auto;
            background:#ffffff;
            border-radius:14px;
            overflow:hidden;
        ">

            <!-- Header -->
            <div style="
                padding:22px 28px;
                border-bottom:1px solid #eeeeee;
                background:#ffffff;
            ">
                <div style="
                    font-size:22px;
                    font-weight:800;
                    color:#4f46e5;
                    letter-spacing:-0.4px;
                ">
                    Keyzoo
                </div>

                <div style="
                    margin-top:4px;
                    font-size:11px;
                    font-weight:700;
                    letter-spacing:1.4px;
                    color:#8a8a8a;
                ">
                    SECURITY ALERT
                </div>
            </div>

            <!-- Hero -->
            <div>
                <img
                    src="https://res.cloudinary.com/dblttl9bh/image/upload/v1790864106/keyzoo/products/gallery/o82kkgcdcrp0pryoakpa.png"
                    alt="Keyzoo"
                    width="620"
                    style="
                        display:block;
                        width:100%;
                        max-width:620px;
                        height:auto;
                        border:0;
                    "
                >
            </div>

            <!-- Content -->
            <div style="
                padding:24px 28px 30px;
            ">

                <div style="
                    font-size:15px;
                    line-height:24px;
                    color:#333333;
                ">
                    Hi ${safeName},
                </div>

                <div style="
                    margin-top:10px;
                    font-size:26px;
                    line-height:34px;
                    font-weight:800;
                    color:#171717;
                    letter-spacing:-0.5px;
                ">
                    Your password was changed
                </div>

                <div style="
                    margin-top:10px;
                    font-size:14px;
                    line-height:22px;
                    color:#666666;
                ">
                    Your Keyzoo account password was successfully changed.
                    For your security, we're letting you know about this
                    change.
                </div>

                <!-- Account Card -->
                <div style="
                    margin-top:22px;
                    padding:16px;
                    background:#f0edff;
                    border-radius:10px;
                ">
                    <div style="
                        font-size:11px;
                        font-weight:700;
                        text-transform:uppercase;
                        letter-spacing:0.8px;
                        color:#6b63a8;
                    ">
                        Account Email
                    </div>

                    <div style="
                        margin-top:6px;
                        font-size:14px;
                        font-weight:700;
                        color:#25214a;
                        word-break:break-word;
                    ">
                        ${safeEmail}
                    </div>
                </div>

                <!-- Changed At -->
                <div style="
                    margin-top:12px;
                    padding:16px;
                    background:#f8f8fb;
                    border:1px solid #eeeeF4;
                    border-radius:10px;
                ">
                    <div style="
                        font-size:11px;
                        font-weight:700;
                        text-transform:uppercase;
                        letter-spacing:0.8px;
                        color:#777777;
                    ">
                        Changed On
                    </div>

                    <div style="
                        margin-top:6px;
                        font-size:14px;
                        font-weight:700;
                        color:#333333;
                    ">
                        ${safeChangedAt}
                    </div>
                </div>

                ${frontendUrl
            ? `
                <!-- Button -->
                <div style="
                    margin-top:24px;
                    text-align:center;
                ">
                    <a
                        href="${escapeHtml(frontendUrl)}"
                        style="
                            display:inline-block;
                            padding:13px 22px;
                            background:#4f46e5;
                            color:#ffffff;
                            text-decoration:none;
                            border-radius:8px;
                            font-size:14px;
                            font-weight:700;
                        "
                    >
                        Secure My Account
                    </a>
                </div>
                `
            : ''
        }

                <!-- Security Notice -->
                <div style="
                    margin-top:24px;
                    padding:15px 16px;
                    background:#f0edff;
                    border-radius:10px;
                ">
                    <div style="
                        font-size:13px;
                        font-weight:700;
                        color:#332d66;
                    ">
                        Didn't make this change?
                    </div>

                    <div style="
                        margin-top:5px;
                        font-size:12px;
                        line-height:19px;
                        color:#5f5a7f;
                    ">
                        If you did not change your password, secure your
                        account immediately and contact Keyzoo support.
                    </div>
                </div>

            </div>

            <!-- Footer -->
            <div style="
                padding:22px 28px 26px;
                border-top:1px solid #eeeeee;
                text-align:center;
            ">

                <div style="
                    font-size:11px;
                    line-height:18px;
                    color:#888888;
                ">
                    This is an automated security notification from Keyzoo.
                    Please do not reply to this email.
                </div>

                <div style="
                    margin-top:14px;
                ">
                    <img
                        src="https://res.cloudinary.com/dblttl9bh/image/upload/v1790918876/keyzoo/products/gallery/p6z9khzaqp55fte2w7sc.svg"
                        width="20"
                        height="20"
                        alt="Social"
                        style="margin:0 5px;"
                    />

                    <img
                        src="https://res.cloudinary.com/dblttl9bh/image/upload/v1790918878/keyzoo/products/gallery/fmyqf2zrvm0tfkrrklfk.svg"
                        width="20"
                        height="20"
                        alt="Social"
                        style="margin:0 5px;"
                    />

                    <img
                        src="https://res.cloudinary.com/dblttl9bh/image/upload/v1790918880/keyzoo/products/gallery/ssijafrjuqfl9e8lh9p1.svg"
                        width="20"
                        height="20"
                        alt="Social"
                        style="margin:0 5px;"
                    />

                    <img
                        src="https://res.cloudinary.com/dblttl9bh/image/upload/v1790918881/keyzoo/products/gallery/yxbmic2pkquqvcqqefgh.svg"
                        width="20"
                        height="20"
                        alt="Social"
                        style="margin:0 5px;"
                    />

                    <img
                        src="https://res.cloudinary.com/dblttl9bh/image/upload/v1790918883/keyzoo/products/gallery/vvbcvxexz6eoy69vriht.svg"
                        width="20"
                        height="20"
                        alt="Social"
                        style="margin:0 5px;"
                    />
                </div>

                <div style="
                    margin-top:12px;
                    font-size:11px;
                    line-height:18px;
                    color:#999999;
                ">
                    © ${new Date().getFullYear()} Keyzoo. All rights reserved.
                </div>

            </div>

        </div>

    </div>

</body>
</html>
`;
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
    buildWelcomeEmail,
    buildVerificationEmail,
    buildOtpEmail,
    buildPasswordResetEmail,
    buildPasswordChangedEmail,
};