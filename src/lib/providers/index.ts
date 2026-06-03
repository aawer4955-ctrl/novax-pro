import { MockAmlProvider } from "./mock-aml-provider";
import { MockCustodyProvider } from "./mock-custody-provider";
import { MockKycProvider } from "./mock-kyc-provider";
import { MockPaymentProvider } from "./mock-payment-provider";

export function getPaymentProvider() { return new MockPaymentProvider(); }
export function getCustodyProvider() { return new MockCustodyProvider(); }
export function getKycProvider() { return new MockKycProvider(); }
export function getAmlProvider() { return new MockAmlProvider(); }
