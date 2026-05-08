type WhatsAppOrderItem = {
  name: string;
  quantity: number;
  price: number;
};

export function buildWhatsAppOrderUrl(
  items: WhatsAppOrderItem[],
  total: number,
  comment?: string,
  meta?: { customerName?: string; orderNumber?: number; title?: string; showLinePrices?: boolean }
) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "77000000000";
  const showLinePrices = meta?.showLinePrices ?? true;
  const lines = [
    meta?.title ?? "Здравствуйте! Хочу оформить заказ Pak Sushi:",
    meta?.orderNumber ? `Заявка #${meta.orderNumber}` : "",
    meta?.customerName ? `Имя: ${meta.customerName}` : "",
    "",
    ...items.map((item) => (showLinePrices ? `- ${item.name} x${item.quantity}: ${item.price * item.quantity} тг` : `- ${item.name} x${item.quantity}`)),
    "",
    `Итого: ${total} тг`,
    comment ? `Комментарий: ${comment}` : ""
  ].filter(Boolean);

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}
