import { RouteContext } from "gadget-server";
const transbank = require('/gadget/app/api/helpers/transbank');

/**
 * Route handler for GET payment_intents/:id/capture
 *
 * @param { RouteContext } route context - see: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 *
 */

export default async function route({ request, reply, api, logger, connections }) {
    const paymentIntentId = request.params.id;
    const paymentIntentData = await api.paymentIntent.findByPaymentIntentId(paymentIntentId);

    const transactionForm = transbank.transactionDataForm(paymentIntentData);

    await reply
        .type('text/html')
        .send(transactionForm);

}