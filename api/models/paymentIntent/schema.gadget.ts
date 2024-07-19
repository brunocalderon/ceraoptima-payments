import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "paymentIntent" model, go to https://optima-payments.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "-2FXOfxOGY1W",
  fields: {
    amount: {
      type: "number",
      validations: { numberRange: { min: 1, max: null } },
      storageKey: "H3D53LOCVJIM",
    },
    cancelledAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "eKvlfhOCrx1X",
    },
    currency: {
      type: "string",
      validations: { stringLength: { min: 3, max: 4 } },
      storageKey: "LNpcmuGDGn1Q",
    },
    externalOrderId: { type: "string", storageKey: "yrlCTQjMJuBd" },
    gateway: { type: "string", storageKey: "DL36uvEpjuRZ" },
    gatewayPaymentIntentId: {
      type: "string",
      storageKey: "fqWYuRH5w3lm",
    },
    gatewayResponse: { type: "json", storageKey: "hs4bwCD-USj-" },
    outcome: { type: "json", storageKey: "o0kUzizrMOL5" },
    paidAt: {
      type: "dateTime",
      includeTime: true,
      storageKey: "nLofWnhBEqcr",
    },
    paymentIntentId: {
      type: "string",
      validations: { unique: true },
      storageKey: "5FIWBSclZkgG",
    },
    paymentMethodDetails: {
      type: "json",
      storageKey: "oPS1Vby146fc",
    },
    status: { type: "string", storageKey: "9livAEcSu-pl" },
  },
};
