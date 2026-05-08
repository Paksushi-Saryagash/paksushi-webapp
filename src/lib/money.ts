export function formatTenge(value: number) {
  return new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0
  }).format(value);
}

export function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}
