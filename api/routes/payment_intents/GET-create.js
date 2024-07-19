import { RouteContext } from "gadget-server";
import { customAlphabet } from 'nanoid';
const transbank = require('/gadget/app/api/helpers/transbank');
const database = require('/gadget/app/api/helpers/database');
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 26)

/**
 * Route handler for GET payment_intents/:id
 *
 * @param { RouteContext } route context - see: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 *
 */

const getLegacyOrder = async (orderId) => {
    // named placeholders for the prepared query
    const orderDataQueryParams = {
        idpedido: orderId,
    };
    // the raw SQL query
    const orderDataQuery = `
    SELECT
        pedidos.idpedido,
        pedidos.totalventa,
        pedidos.payment_status
    FROM
        pedidos
    WHERE
        idpedido = :idpedido`;
    // execute the query
    const connection = await database.createConnection();
    const orderData = await database.executePreparedQuery(connection, orderDataQuery, orderDataQueryParams);
    await database.releaseConnection(connection);
    if (orderData.length === 1) {
        return orderData[0];
    }
}

export default async function route({ request, reply, api, logger, connections }) {
    const orderId = request.query.external_order_id;
    const externalOrderId = `OPTS${orderId}`
    const paymentIntentId = nanoid();
    const orderData = await getLegacyOrder(orderId);
    const amount = parseInt(orderData.totalventa);

    if (orderData.payment_status === 'paid') {
        const completedPaymentIntent = await api.paymentIntent.maybeFindFirst({
            filter: {
                externalOrderId: { equals: externalOrderId },
                status: { equals: 'succeeded' },
            },
        });
        if (completedPaymentIntent !== null) {
            const completedPaymentIntentId = completedPaymentIntent.paymentIntentId;
            await reply
                .code(302)
                .redirect(`${process.env.TRANSBANK_MERCHANT_URL}/payment_intents/${completedPaymentIntentId}/status`)
        } else {
            await reply
                .send('No es posible inicializar la transacción');
        }
    } else {
        const paymentIntent = await transbank.createPaymentIntent(paymentIntentId, externalOrderId, amount);
        await api.paymentIntent.create({
            amount: amount,
            currency: 'clp',
            paymentIntentId: paymentIntentId,
            externalOrderId: externalOrderId,
            status: 'pending',
            gateway: 'transbank_webpay_plus_rest',
            gatewayPaymentIntentId: paymentIntent.token,
        });
        const redirectionForm = transbank.getRedirectionForm(paymentIntent.url, 'POST', 'token_ws', paymentIntent.token)
        await reply
            .type('text/html')
            .send(redirectionForm);
    }

}

