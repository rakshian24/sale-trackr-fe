import type { TFunction } from "i18next";

export const getUnitLabel = (
  t: TFunction,
  unit?: "kg" | "g" | "l" | "ml" | "nos" | "bunch" | string,
) => {
  if (!unit) return "-";
  if (unit === "kg" || unit === "g" || unit === "l" || unit === "ml" || unit === "nos" || unit === "bunch") {
    return t(`common.unit.${unit}`);
  }
  return unit;
};

export const getPaymentModeLabel = (t: TFunction, paymentMode: string) => {
  if (paymentMode === "CASH") return t("common.cash");
  if (paymentMode === "UPI") return t("common.upi");
  return paymentMode;
};
