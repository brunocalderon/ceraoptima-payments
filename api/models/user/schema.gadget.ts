import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "user" model, go to https://optima-payments.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "TxBFQ4nzgR0b",
  fields: {
    email: {
      type: "email",
      validations: { required: true, unique: true },
      storageKey: "CdZAbhxBoEo-",
    },
    emailVerificationToken: {
      type: "string",
      storageKey: "FySawO4-UXNt",
    },
    emailVerificationTokenExpiration: {
      type: "dateTime",
      includeTime: true,
      storageKey: "EwgI6c1osban",
    },
    emailVerified: {
      type: "boolean",
      default: false,
      storageKey: "7xRr9bGiyt7G",
    },
    firstName: { type: "string", storageKey: "bTjNlkGnNDGY" },
    googleImageUrl: { type: "url", storageKey: "gdijJ9HgzCJ_" },
    googleProfileId: { type: "string", storageKey: "faf4kwE0EByY" },
    lastName: { type: "string", storageKey: "ZBa3VIuA1TUu" },
    lastSignedIn: {
      type: "dateTime",
      includeTime: true,
      storageKey: "CJyZn7Cv1aO9",
    },
    password: {
      type: "password",
      validations: { strongPassword: true },
      storageKey: "pnWFCQcTpaWG",
    },
    resetPasswordToken: {
      type: "string",
      storageKey: "QKwtgDCvC0CR",
    },
    resetPasswordTokenExpiration: {
      type: "dateTime",
      includeTime: true,
      storageKey: "cG412O-pvUaq",
    },
    roles: {
      type: "roleList",
      default: ["unauthenticated"],
      storageKey: "De2dDvFXrrez",
    },
  },
};
