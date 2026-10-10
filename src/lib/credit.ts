export type SimulationInput = {
  priceUf: number;
  /** Fracción del precio que se paga como pie, entre 0 y 1. 1 equivale a pago contado. */
  downPaymentPct: number;
  /** Valor de 1 UF en pesos. */
  ufValue: number;
};

export type SimulationResult = {
  downPaymentUf: number;
  balanceUf: number;
  priceClp: number;
  downPaymentClp: number;
  balanceClp: number;
};

/**
 * Separa el precio en pie y saldo. No calcula la cuota: el crédito directo lleva un interés
 * que la inmobiliaria informa en la cotización, junto con los descuentos vigentes.
 */
export function simulate({ priceUf, downPaymentPct, ufValue }: SimulationInput): SimulationResult {
  if (!(priceUf > 0)) throw new RangeError("priceUf debe ser mayor que 0");
  if (!(downPaymentPct >= 0 && downPaymentPct <= 1)) throw new RangeError("downPaymentPct debe estar entre 0 y 1");
  if (!(ufValue > 0)) throw new RangeError("ufValue debe ser mayor que 0");

  const downPaymentUf = priceUf * downPaymentPct;
  const balanceUf = priceUf - downPaymentUf;

  return {
    downPaymentUf,
    balanceUf,
    priceClp: Math.round(priceUf * ufValue),
    downPaymentClp: Math.round(downPaymentUf * ufValue),
    balanceClp: Math.round(balanceUf * ufValue),
  };
}
