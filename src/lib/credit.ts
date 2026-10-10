export type SimulationInput = {
  priceUf: number;
  /** Fracción del precio que se paga como pie, entre 0 y 1. */
  downPaymentPct: number;
  months: number;
  /** Tasa mensual como fracción (0.01 = 1%). 0 significa sin interés. */
  monthlyRate: number;
  /** Valor de 1 UF en pesos. */
  ufValue: number;
};

export type SimulationResult = {
  downPaymentUf: number;
  balanceUf: number;
  installmentUf: number;
  downPaymentClp: number;
  balanceClp: number;
  installmentClp: number;
};

export function simulate({ priceUf, downPaymentPct, months, monthlyRate, ufValue }: SimulationInput): SimulationResult {
  if (!(priceUf > 0)) throw new RangeError("priceUf debe ser mayor que 0");
  if (!(downPaymentPct >= 0 && downPaymentPct <= 1)) throw new RangeError("downPaymentPct debe estar entre 0 y 1");
  if (!Number.isInteger(months) || months <= 0) throw new RangeError("months debe ser un entero positivo");
  if (!(monthlyRate >= 0)) throw new RangeError("monthlyRate no puede ser negativa");
  if (!(ufValue > 0)) throw new RangeError("ufValue debe ser mayor que 0");

  const downPaymentUf = priceUf * downPaymentPct;
  const balanceUf = priceUf - downPaymentUf;
  const installmentUf =
    monthlyRate === 0 ? balanceUf / months : (balanceUf * monthlyRate) / (1 - (1 + monthlyRate) ** -months);

  return {
    downPaymentUf,
    balanceUf,
    installmentUf,
    downPaymentClp: Math.round(downPaymentUf * ufValue),
    balanceClp: Math.round(balanceUf * ufValue),
    installmentClp: Math.round(installmentUf * ufValue),
  };
}
