export type CreditConfig = {
  /** Fracciones del precio ofrecidas como pie. */
  downPaymentOptions: readonly number[];
  /** Plazos en meses. */
  termOptions: readonly number[];
  /** Tasa mensual como fracción. 0 = sin interés. */
  monthlyRate: number;
  defaultDownPayment: number;
  defaultTerm: number;
  /** Valor de la UF usado cuando la API no responde. Actualizar de vez en cuando. */
  fallbackUfValue: number;
};

export const creditConfig: CreditConfig = {
  downPaymentOptions: [0.3, 0.5],
  termOptions: [12, 24, 36, 48],
  monthlyRate: 0,
  defaultDownPayment: 0.5,
  defaultTerm: 48,
  fallbackUfValue: 41136,
};

/** Plazo más largo ofrecido. Todo texto que mencione "N cuotas" debe usar este valor. */
export const maxTerm = Math.max(...creditConfig.termOptions);
/** Pie más bajo ofrecido, como fracción. */
export const minDownPayment = Math.min(...creditConfig.downPaymentOptions);
