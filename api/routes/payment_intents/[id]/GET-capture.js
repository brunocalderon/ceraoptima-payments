import { RouteContext } from "gadget-server";
const transbank = require('/gadget/app/api/helpers/transbank');

/**
 * Route handler for GET payment_intents/:id/capture
 *
 * @param { RouteContext } route context - see: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 *
 */

const getPaymentMethodDetails = (paymentIntentData) => {
    const fundingType = transbank.translatePaymentTypeCode(paymentIntentData.payment_type_code);
    return {
        funding: fundingType.funding,
        installments: paymentIntentData.installments_number,
        last4: paymentIntentData.card_detail.card_number,
        network: 'transbank',
    }
}

const getOutcome = (paymentIntentData) => {
    const outcome = transbank.translateResponseCode(paymentIntentData.response_code);
    return {
        network_status: outcome.network_status,
        seller_message: outcome.seller_message,
        type: outcome.type,
    }
}

const getStatus = (paymentIntentData) => {
    const outcome = transbank.translateResponseCode(paymentIntentData.response_code);
    return outcome.status;
}

export default async function route({ request, reply, api, logger, connections }) {
    const gatewayPaymentIntentId = request.query.token_ws;
    const paymentIntentId = request.params.id;

    const capturedPaymentIntent = await transbank.capturePaymentIntent(gatewayPaymentIntentId);
    const paymentIntentData = await api.paymentIntent.findByPaymentIntentId(paymentIntentId);
    const paymentIntentRecordId = paymentIntentData.id;

    const paymentMethodDetails = getPaymentMethodDetails(capturedPaymentIntent);
    const outcome = getOutcome(capturedPaymentIntent);
    const status = getStatus(capturedPaymentIntent);
    const timestamp = transbank.getTimestamp(capturedPaymentIntent.transaction_date);
    const externalOrderId = parseInt(capturedPaymentIntent.session_id.replace('OPTS', ''));

    const paymentIntentUpdateData = {
        gatewayResponse: capturedPaymentIntent,
        paymentMethodDetails: paymentMethodDetails,
        outcome: outcome,
        status: status,
        paidAt: timestamp,
    };

    await api.paymentIntent.update(paymentIntentRecordId, paymentIntentUpdateData);

    if (capturedPaymentIntent.response_code === 0) {
        await api.enqueue(
            api.updateOrder,
            {
                orderId: externalOrderId,
            },
            {
                queue: "update-orders"
            }
        );
    }

    if (paymentIntentId === capturedPaymentIntent.buy_order) {
        await reply
            .code(302)
            .redirect(`${process.env.TRANSBANK_MERCHANT_URL}/payment_intents/${paymentIntentId}/status`)
    }

}