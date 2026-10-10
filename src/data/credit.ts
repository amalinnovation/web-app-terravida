export type CreditConfig = {
  /** Fracción del precio exigida como pie al comprar con crédito directo. */
  downPaymentPct: number;
  /** Plazos en meses para el saldo. */
  termOptions: readonly number[];
  defaultTerm: number;
  /** Reserva en pesos. No forma parte del valor de la parcela. */
  reservationClp: number;
  /** Plazo de escritura en notaría, en días. */
  deedDays: string;
  /** Valor de la UF usado cuando la API no responde. Actualizar de vez en cuando. */
  fallbackUfValue: number;
};

export const creditConfig: CreditConfig = {
  downPaymentPct: 0.5,
  termOptions: [12, 24, 36, 48],
  defaultTerm: 48,
  reservationClp: 500000,
  deedDays: "10 a 15",
  fallbackUfValue: 41136,
};

/** Plazo más largo ofrecido. Todo texto que mencione "N cuotas" debe usar este valor. */
export const maxTerm = Math.max(...creditConfig.termOptions);
