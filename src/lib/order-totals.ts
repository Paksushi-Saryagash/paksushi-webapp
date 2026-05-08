import { OrderType } from "@prisma/client";
import { calculateOrderTotals, type SetBuilderItem, type SetBuilderRuleInput } from "@/lib/set-builder";

export function calculateRegularOrder(items: SetBuilderItem[]) {
  const lines = items.map((item) => {
    const lineRevenue = item.sellingPrice * item.quantity;
    const lineCost = item.costPrice * item.quantity;

    return {
      menuItemId: item.id,
      nameSnapshot: item.name,
      quantity: item.quantity,
      sellingPriceSnapshot: item.sellingPrice,
      costPriceSnapshot: item.costPrice,
      setBuilderPriceSnapshot: item.setBuilderPrice,
      finalUnitPrice: item.sellingPrice,
      lineRevenue,
      lineCost,
      lineProfit: lineRevenue - lineCost
    };
  });

  const totalRevenue = lines.reduce((total, line) => total + line.lineRevenue, 0);
  const totalCost = lines.reduce((total, line) => total + line.lineCost, 0);

  return {
    type: OrderType.REGULAR,
    normalTotal: totalRevenue,
    finalTotal: totalRevenue,
    costTotal: totalCost,
    profitTotal: totalRevenue - totalCost,
    lines
  };
}

export function calculatePublicOrder(items: SetBuilderItem[], rule: SetBuilderRuleInput, orderType: "REGULAR" | "CUSTOM_SET") {
  if (orderType === "CUSTOM_SET") {
    return calculateOrderTotals(items, rule);
  }

  return calculateRegularOrder(items);
}
