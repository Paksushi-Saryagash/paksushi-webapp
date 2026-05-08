export type SetBuilderItem = {
  id: string;
  name: string;
  quantity: number;
  sellingPrice: number;
  costPrice: number;
  setBuilderPrice: number;
};

export type SetBuilderRuleInput = {
  threshold: number;
  isActive: boolean;
  useSetPriceSum: boolean;
};

export function calculateSetBuilder(items: SetBuilderItem[], rule: SetBuilderRuleInput) {
  const expanded = items.filter((item) => item.quantity > 0);
  const normalTotal = expanded.reduce((total, item) => total + item.sellingPrice * item.quantity, 0);
  const setBuilderTotal = expanded.reduce((total, item) => total + item.setBuilderPrice * item.quantity, 0);
  const costTotal = expanded.reduce((total, item) => total + item.costPrice * item.quantity, 0);
  const isCustomSet = rule.isActive && setBuilderTotal >= rule.threshold;
  const finalTotal = isCustomSet && rule.useSetPriceSum ? setBuilderTotal : normalTotal;

  return {
    type: isCustomSet ? "CUSTOM_SET" : "REGULAR",
    normalTotal,
    finalTotal,
    costTotal,
    profitTotal: finalTotal - costTotal,
    isCustomSet
  } as const;
}

export function calculateOrderTotals(items: SetBuilderItem[], rule: SetBuilderRuleInput) {
  const setResult = calculateSetBuilder(items, rule);
  const finalTotal = setResult.finalTotal;
  const normalTotal = setResult.normalTotal;
  const ratio = normalTotal > 0 && setResult.isCustomSet ? finalTotal / normalTotal : 1;

  const lines = items.map((item) => {
    const originalLine = item.sellingPrice * item.quantity;
    const lineRevenue = Math.round(originalLine * ratio);
    const lineCost = item.costPrice * item.quantity;

    return {
      menuItemId: item.id,
      nameSnapshot: item.name,
      quantity: item.quantity,
      sellingPriceSnapshot: item.sellingPrice,
      costPriceSnapshot: item.costPrice,
      setBuilderPriceSnapshot: item.setBuilderPrice,
      finalUnitPrice: Math.round(lineRevenue / item.quantity),
      lineRevenue,
      lineCost,
      lineProfit: lineRevenue - lineCost
    };
  });

  const lineRevenueTotal = lines.reduce((total, line) => total + line.lineRevenue, 0);
  const roundingDiff = finalTotal - lineRevenueTotal;

  if (lines.length > 0 && roundingDiff !== 0) {
    const lastLine = lines[lines.length - 1];
    lastLine.lineRevenue += roundingDiff;
    lastLine.lineProfit += roundingDiff;
    lastLine.finalUnitPrice = Math.round(lastLine.lineRevenue / lastLine.quantity);
  }

  return {
    ...setResult,
    lines
  };
}
