export const handleAddOrder = (type = null, idCount) => {
  return {
    id: idCount,
    name: `${idCount}-${type.toUpperCase()}`,
    status: "pending",
    type: type,
  };
};

export const handleOrderTabMove = (
  currentOrder,
  vipOrders,
  normalOrders,
  processedOrders,
  type
) => {
  let orderType;

  if (type === "vip") {
    orderType = vipOrders;
  } else if (type === "normal") {
    orderType = normalOrders;
  }

  let orderIndex = orderType.value.indexOf(currentOrder);

  if (orderIndex !== -1) {
    orderType.value.splice(orderIndex, 1);
  }

  processedOrders.value.push(currentOrder);
};

export const handleBotDelete = (bot) => {
  if (!bot.timerId || !bot.currentOrder) return;

  clearTimeout(bot.timerId);

  bot.currentOrder.status = "pending";
};
