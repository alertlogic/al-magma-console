const SI_SYMBOL = ['', 'k', 'M', 'G', 'T', 'P', 'E'];

interface Summary {
  count: string;
  suffix: string;
}

/*
 * Turns numbers such as 1245 into 1.2k, 98765 into 98.7k etc
 */
export const numberContract = (n: number): Summary => {
  /* tslint:disable:no-bitwise */
  const tier = Math.log10(n) / 3 | 0;
  /* tslint:disable:no-bitwise */

  if (tier === 0) {
    return {
      count: String(n),
      suffix: ''
    };
  } else {
    const suffix: string = SI_SYMBOL[tier];
    const scale: number = Math.pow(10, tier * 3);
    const scaled: number = n / scale;

    return {
      suffix,
      count: String(scaled.toFixed(1))
    };
  }
};
