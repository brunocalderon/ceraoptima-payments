const axios = require('axios');
/* dayjs */
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const dayjsTimeZone = "America/Santiago";
dayjs.extend(utc);
dayjs.extend(timezone);
/* dayjs */

const transbankClient = async (path, method, requestData = '') => {
    const axiosRequestConfig = {
        url: `${process.env.TRANSBANK_API_URL}${path}`,
        method: method,
        headers: {
            'Tbk-Api-Key-Id': process.env.TRANSBANK_MERCHANT_CODE,
            'Tbk-Api-Key-Secret': process.env.TRANSBANK_MERCHANT_KEY,
            'Content-Type': 'application/json',
        },
        json: true,
    };
    if (requestData !== '') {
        axiosRequestConfig.data = requestData;
    };
    try {
        const request = await axios(axiosRequestConfig);
        const response = request.data;
        return response;
    } catch (e) {
        console.log(JSON.stringify(e));
        return e;
    }
}

module.exports.createPaymentIntent = async (paymentIntentId, externalOrderId, amount) => {
    const path = '/rswebpaytransaction/api/webpay/v1.2/transactions';
    const method = 'post';
    const requestData = {
        buy_order: paymentIntentId,
        session_id: externalOrderId,
        amount: parseInt(amount),
        return_url: `${process.env.TRANSBANK_MERCHANT_URL}/payment_intents/${paymentIntentId}/capture`,
    }
    const request = await transbankClient(path, method, requestData);
    return request;
}

module.exports.capturePaymentIntent = async (paymentIntentToken) => {
    const path = `/rswebpaytransaction/api/webpay/v1.2/transactions/${paymentIntentToken}`;
    const method = 'put';
    const request = await transbankClient(path, method, {});
    return request;
}

module.exports.paymentIntentStatus = async (paymentIntentToken) => {
    const path = `/rswebpaytransaction/api/webpay/v1.2/transactions/${paymentIntentToken}`;
    const method = 'get';
    const request = await transbankClient(path, method);
    return request;
}

module.exports.translateVci = (vci) => {
    const vcis = [
        {
            code: 'TSY',
            network_status: 'approved_by_network',
            reason: null,
        },
        {
            code: 'TSN',
            network_status: 'declined_by_network',
            reason: 'Autenticación Rechazada',
        },
        {
            code: 'NP',
            network_status: 'declined_by_network',
            reason: 'No Participa, sin autenticación',
        },
        {
            code: 'U3',
            network_status: 'declined_by_network',
            reason: 'Falla conexión, Autenticación Rechazada',
        },
        {
            code: 'INV',
            network_status: 'not_sent_to_network',
            reason: 'Datos Inválidos',
        },
        {
            code: 'A',
            network_status: 'not_sent_to_network',
            reason: 'Intentó',
        },
        {
            code: 'CNP1',
            network_status: 'not_sent_to_network',
            reason: 'Comercio no participa',
        },
        {
            code: 'EOP',
            network_status: 'not_sent_to_network',
            reason: 'Error operacional',
        },
        {
            code: 'BNA',
            network_status: 'not_sent_to_network',
            reason: 'BIN no adherido',
        },
        {
            code: 'ENA',
            network_status: 'not_sent_to_network',
            reason: 'Emisor no adherido',
        }
    ];
}

const translatePaymentTypeCode = (paymentTypeCode) => {
    const paymentTypeCodes = [
        {
            code: 'VD',
            funding: 'debit',
            funding_human: 'Débito',
        },
        {
            code: 'VP',
            funding: 'prepaid',
            funding_human: 'Prepagada',
        },
        {
            code: 'VN',
            funding: 'credit',
            funding_human: 'Crédito',
        },
        {
            code: 'VC',
            funding: 'credit',
            funding_human: 'Crédito',
        },
        {
            code: 'SI',
            funding: 'credit',
            funding_human: 'Crédito',
        },
        {
            code: 'S2',
            funding: 'credit',
            funding_human: 'Crédito',
        },
        {
            code: 'NC',
            funding: 'credit',
            funding_human: 'Crédito',
        },
    ];
    const translatedPaymentTypeCode = paymentTypeCodes.find(item => item.code === paymentTypeCode);
    return translatedPaymentTypeCode;
}

module.exports.translatePaymentTypeCode = translatePaymentTypeCode;

const translateResponseCode = (responseCode) => {
    const responseCodesLevel1 = [
        {
            code: 0,
            status: 'succeeded',
            status_human: 'Aprobada',
            network_status: 'approved_by_network',
            seller_message: '',
            type: 'authorized',
        },
        {
            code: -1,
            status: 'failed',
            status_human: 'Rechazada',
            network_status: 'not_sent_to_network',
            seller_message: 'Rechazo - Posible error en el ingreso de datos de la transacción',
            type: 'generic_decline',
        },
        {
            code: -2,
            status: 'failed',
            status_human: 'Rechazada',
            network_status: 'not_sent_to_network',
            seller_message: 'Rechazo - Se produjo fallo al procesar la transacción, este mensaje de rechazo se encuentra relacionado a parámetros de la tarjeta y/o su cuenta asociada',
            type: 'generic_decline',
        },
        {
            code: -3,
            status: 'failed',
            status_human: 'Rechazada',
            network_status: 'declined_by_network',
            seller_message: 'Rechazo - Error en Transacción',
            type: 'generic_decline',
        },
        {
            code: -4,
            status: 'failed',
            status_human: 'Rechazada',
            network_status: 'declined_by_network',
            seller_message: 'Rechazo - Rechazada por parte del emisor',
            type: 'do_not_honor',
        },
        {
            code: -5,
            status: 'failed',
            status_human: 'Rechazada',
            network_status: 'declined_by_network',
            seller_message: 'Rechazo - Transacción con riesgo de posible fraude',
            type: 'fraudulent',
        },
    ];

    const responseCodesLevel2 = [
        {
            code: 0,
            status: 'succeeded',
            seller_message: '',
        },
        {
            code: -1,
            status: 'failed',
            seller_message: 'Tarjeta inválida',
        },
        {
            code: -2,
            status: 'failed',
            seller_message: 'Error de conexión',
        },
        {
            code: -3,
            status: 'failed',
            seller_message: 'Excede monto máximo',
        },
        {
            code: -4,
            status: 'failed',
            seller_message: 'Fecha de expiración inválida',
        },
        {
            code: -5,
            status: 'failed',
            seller_message: 'Problema en autenticación',
        },
        {
            code: -6,
            status: 'failed',
            seller_message: 'Rechazo general',
        },
        {
            code: -7,
            status: 'failed',
            seller_message: 'Tarjeta bloqueada',
        },
        {
            code: -8,
            status: 'failed',
            seller_message: 'Tarjeta vencida',
        },
        {
            code: -9,
            status: 'failed',
            seller_message: 'Transacción no soportada',
        },
        {
            code: -10,
            status: 'failed',
            seller_message: 'Problema en la transacción',
        },
        {
            code: -11,
            status: 'failed',
            seller_message: 'Excede límite de reintentos de rechazos',
        },
    ];

    const translatedResponseCode = responseCodesLevel1.find(item => item.code === responseCode);
    return translatedResponseCode;
}

module.exports.translateResponseCode = translateResponseCode;

module.exports.getTimestamp = (timestamp) => {
    return dayjs(timestamp).utc().toISOString();
}

/* boring forms below */

module.exports.getRedirectionForm = (url, method, input, token) => {
    return `<html>
    <head>
    <title>WebPay Plus</title>
    <style>
        body,
        html {
          width: 100%;
          height: 100%;
          font-size: 10px;
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          text-align: center;
          background: rgb(244, 246, 248);
          font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif;
          color: #212b36;
        }

        .wrapper {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
          width: 100%;
        }

        .ui-spinner {
          -webkit-transform-origin: 2.2rem 2.2rem 2.2rem;
          transform-origin: 2.2rem 2.2rem 2.2rem;
          -webkit-box-sizing: border-box;
          box-sizing: border-box;
          display: inline-block;
          height: 4.4rem;
          width: 4.4rem;
          -webkit-animation: ui-spinner-rotate 0.5s linear infinite;
          animation: ui-spinner-rotate 0.5s linear infinite;
          background-color: transparent;
          border: 0.3rem solid #47c1bf;
          border-left-color: transparent;
          border-radius: 50%;
        }

        @-webkit-keyframes ui-spinner-rotate {
          100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg)
          }
        }

        @keyframes ui-spinner-rotate {
          100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg)
          }
        }
    </style>

    </head>
    <body>
      <div class="wrapper">
        <span role="img" class="ui-spinner"></span>
      </div>
      <form action="${url}" id="webpay-form" method="${method}">
        <input type="hidden" name="${input}" value="${token}" />
      </form>
      <script>document.getElementById("webpay-form").submit();</script>
    </body>
    </html>`;
};

module.exports.transactionDataForm = (transactionDataRaw) => {
    const transactionData = transactionDataRaw.gatewayResponse;
    const translatedPaymentTypeCode = translatePaymentTypeCode(transactionDataRaw.gatewayResponse.payment_type_code).funding_human;
    const translatedResponseCode = translateResponseCode(transactionDataRaw.gatewayResponse.response_code).status_human;
    const date = dayjs.tz(dayjs(transactionData.transaction_date), dayjsTimeZone).format('DD/MM/YYYY');
    const time = dayjs.tz(dayjs(transactionData.transaction_date), dayjsTimeZone).format('HH:mm:ss');
    return `<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Optima - Pago Realizado</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@docsearch/css@3" />
        <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css"
            integrity="sha512-jnSuA4Ss2PkkikSOLtYs8BlYIeeIK1h99ty4YfvRPAlzr377vr3CXDb7sb7eEEBYjDtcYj+AjBH3FLv5uSJuXg=="
            crossorigin="anonymous"
            referrerpolicy="no-referrer"
        />
        <meta name="theme-color" content="#712cf9" />
        <style>
            .bd-placeholder-img {
                font-size: 1.125rem;
                text-anchor: middle;
                -webkit-user-select: none;
                -moz-user-select: none;
                user-select: none;
            }

            @media (min-width: 768px) {
                .bd-placeholder-img-lg {
                    font-size: 3.5rem;
                }
            }

            .b-example-divider {
                width: 100%;
                height: 3rem;
                background-color: rgba(0, 0, 0, 0.1);
                border: solid rgba(0, 0, 0, 0.15);
                border-width: 1px 0;
                box-shadow: inset 0 0.5em 1.5em rgba(0, 0, 0, 0.1), inset 0 0.125em 0.5em rgba(0, 0, 0, 0.15);
            }

            .b-example-vr {
                flex-shrink: 0;
                width: 1.5rem;
                height: 100vh;
            }

            .bi {
                vertical-align: -0.125em;
                fill: currentColor;
            }

            .nav-scroller {
                position: relative;
                z-index: 2;
                height: 2.75rem;
                overflow-y: hidden;
            }

            .nav-scroller .nav {
                display: flex;
                flex-wrap: nowrap;
                padding-bottom: 1rem;
                margin-top: -1px;
                overflow-x: auto;
                text-align: center;
                white-space: nowrap;
                -webkit-overflow-scrolling: touch;
            }

            .btn-bd-primary {
                --bd-violet-bg: #712cf9;
                --bd-violet-rgb: 112.520718, 44.062154, 249.437846;
                --bs-btn-font-weight: 600;
                --bs-btn-color: var(--bs-white);
                --bs-btn-bg: var(--bd-violet-bg);
                --bs-btn-border-color: var(--bd-violet-bg);
                --bs-btn-hover-color: var(--bs-white);
                --bs-btn-hover-bg: #6528e0;
                --bs-btn-hover-border-color: #6528e0;
                --bs-btn-focus-shadow-rgb: var(--bd-violet-rgb);
                --bs-btn-active-color: var(--bs-btn-hover-color);
                --bs-btn-active-bg: #5a23c8;
                --bs-btn-active-border-color: #5a23c8;
            }

            .bd-mode-toggle {
                z-index: 1500;
            }

            .bd-mode-toggle .dropdown-menu .active .bi {
                display: block !important;
            }
            html,
            body {
                height: 100%;
            }

            body {
                display: -ms-flexbox;
                display: -webkit-box;
                display: flex;
                -ms-flex-align: center;
                -ms-flex-pack: center;
                -webkit-box-align: center;
                align-items: center;
                -webkit-box-pack: center;
                justify-content: center;
                padding-bottom: 40px;
                background-color: #f5f5f5;
            }

            .form-signin {
                width: 100%;
                margin: 0 auto;
            }
            .form-signin .checkbox {
                font-weight: 400;
            }
            .form-signin .form-control {
                position: relative;
                box-sizing: border-box;
                height: auto;
                padding: 10px;
                font-size: 16px;
            }
            .form-signin .form-control:focus {
                z-index: 2;
            }
        </style>
    </head>
    <body class="d-flex align-items-center">
        <main class="w-100 container">
            <div class="row align-items-center justify-content-center">
                <div class="col-4 text-center">
                    <img class="mb-4 img-fluid" src="https://images.jumpseller.com/store/ceraoptima/store/logo/logo.png?1693971273" alt="" width="200" />
                    <h1 class="h3 fw-normal">Comprobante de Pago</h1>
                </div>
            </div>
            <div class="row align-items-center justify-content-center">
                <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4 text-center">
                    <table class="table w-100 my-3 text-start">
                        <tbody>
                            <tr>
                                <th scope="row">Respuesta transacción</th>
                                <th>:</th>
                                <td>${translatedResponseCode}</td>
                            </tr>

                            <tr></tr>
                            <tr>
                                <th scope="row">Orden de compra</th>
                                <th>:</th>
                                <td>${transactionData.session_id}</td>
                            </tr>

                            <tr></tr>
                            <tr>
                                <th scope="row">Código autorización</th>
                                <th>:</th>
                                <td>${transactionData.authorization_code}</td>
                            </tr>

                            <tr></tr>
                            <tr>
                                <th scope="row">Fecha transacción</th>
                                <th>:</th>
                                <td>${date}</td>
                            </tr>

                            <tr></tr>
                            <tr>
                                <th scope="row">Hora transacción</th>
                                <th>:</th>
                                <td>${time}</td>
                            </tr>

                            <tr></tr>
                            <tr>
                                <th scope="row">Últimos 4 dígitos tarjeta</th>
                                <th>:</th>
                                <td>${transactionData.card_detail.card_number}</td>
                            </tr>

                            <tr></tr>
                            <tr>
                                <th scope="row">Tipo tarjeta</th>
                                <th>:</th>
                                <td>${translatedPaymentTypeCode}</td>
                            </tr>

                            <tr></tr>
                            <tr>
                                <th scope="row">Cuotas</th>
                                <th>:</th>
                                <td>${transactionData.installments_number === 0 ? 'Sin cuotas' : transactionData.installments_number}</td>
                            </tr>

                            <tr></tr>
                            <tr>
                                <th scope="row">Monto compra</th>
                                <th>:</th>
                                <td>${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(transactionData.amount)}</td>
                            </tr>

                            <tr></tr>
                        </tbody>
                    </table>
                    <p class="mt-5 mb-3 text-body-secondary">
                        &copy; Optima SpA
                    </p>
                </div>
            </div>
        </main>
        <script
            src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/js/bootstrap.min.js"
            integrity="sha512-ykZ1QQr0Jy/4ZkvKuqWn4iF3lqPZyij9iRv6sGqLRdTPkY69YX6+7wvVGmsdBbiIfN/8OdsI7HABjvEok6ZopQ=="
            crossorigin="anonymous"
            referrerpolicy="no-referrer"
        ></script>
    </body>
</html>`;
}