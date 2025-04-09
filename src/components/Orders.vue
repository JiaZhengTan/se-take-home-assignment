<script setup>
import {
  handleAddOrder,
  handleBotDelete,
  handleOrderTabMove,
} from "./orderingUtils";
import { ref } from "vue";

const pendingOrdersNormal = ref([]);
const pendingOrdersVip = ref([]);
const processedOrder = ref([]);

const orderCount = ref(0);
const botCount = ref(0);

const idleBots = ref([]);
const activeBots = ref([]);

const addBot = () => {
  botCount.value++;

  const botStruct = {
    id: botCount.value,
    timerId: null,
    currentOrder: null,
    processOrder: function (order, type) {
      this.currentOrder = order;

      // Simulate processing time of 10 sec
      this.timerId = setTimeout(() => {
        this.currentOrder.status = "completed";

        // Move tab from pending to processed
        handleOrderTabMove(
          order,
          pendingOrdersVip,
          pendingOrdersNormal,
          processedOrder,
          type
        );

        // Clear when done
        this.timerId = null;
        this.currentOrder = null;

        // Move bot from active to idle
        idleBots.value.push(this);
        activeBots.value.splice(activeBots.value.indexOf(this), 1);

        // Start processing the next order
        startProcessingOrders();
      }, 10000);
    },
  };

  idleBots.value.push(botStruct);

  startProcessingOrders();
};

const deleteBot = () => {
  const activeBotIndex = activeBots.value.findIndex(
    (bot) => bot.id === botCount.value
  );
  const idleBotIndex = idleBots.value.findIndex(
    (bot) => bot.id === botCount.value
  );

  if (activeBotIndex === -1 && idleBotIndex === -1) return;

  let botToDelete;

  if (activeBotIndex !== -1) {
    botToDelete = activeBots.value[activeBotIndex];
    activeBots.value.splice(activeBotIndex, 1);
  } else if (idleBotIndex !== -1) {
    botToDelete = idleBots.value[idleBotIndex];
    idleBots.value.splice(idleBotIndex, 1);
  }

  handleBotDelete(botToDelete);

  botCount.value--;
};

const addOrder = (type) => {
  orderCount.value++;

  let order = handleAddOrder(type, orderCount.value);

  if (type === "normal") {
    pendingOrdersNormal.value.push(order);
  } else if (type === "vip") {
    pendingOrdersVip.value.push(order);
  }

  startProcessingOrders();
};

const startProcessingOrders = () => {
  const { length: lengthForNormal } = pendingOrdersNormal.value;
  const { length: lengthForVip } = pendingOrdersVip.value;

  if (lengthForVip === 0 && lengthForNormal === 0) return;

  if (idleBots.value.length === 0) return;

  let order = null;

  if (lengthForVip > 0) {
    order = startNextPendingOrder(pendingOrdersVip.value);

    if (!order) return;

    idleBots.value[0].processOrder(order, "vip");
  } else if (lengthForNormal > 0) {
    order = startNextPendingOrder(pendingOrdersNormal.value);

    if (!order) return;

    idleBots.value[0].processOrder(order, "normal");
  }

  activeBots.value.push(idleBots.value.shift());
};

const startNextPendingOrder = (orders) => {
  const pendingOrder = orders.find((order) => order.status === "pending");

  if (!pendingOrder) return false;

  pendingOrder.status = "processing";

  return pendingOrder;
};
</script>

<template>
  <!-- Orders -->
  <div class="flex flex-row gap-5 mt-10">
    <!-- Pending Tab -->
    <div class="w-[100%]">
      <label>Pending...</label>
      <div class="border-2 border-solid p-2 h-94 max-h-94">
        <div v-for="order in pendingOrdersVip" :key="order.id">
          {{ order.name }}
        </div>
        <div v-for="order in pendingOrdersNormal" :key="order.id">
          {{ order.name }}
        </div>
      </div>
    </div>
    <!-- Completed Tab -->
    <div class="w-[100%]">
      <label>Completed</label>
      <div class="border-2 border-solid p-2 h-94 max-h-94">
        <div v-for="order in processedOrder" :key="order.id">
          {{ order.name }}
        </div>
      </div>
    </div>
  </div>

  <!-- Buttons -->
  <div class="flex flex-row mt-5 gap-4">
    <button class="btn btn-primary" @click="addOrder('normal')">
      Add Order For Normal Customer
    </button>
    <button class="btn btn-primary" @click="addOrder('vip')">
      Add Order For VIP Customer
    </button>
  </div>
  <div class="flex flex-row mt-5 gap-4">
    <button class="btn btn-secondary" @click="addBot">+ Add Bot</button>
    <button class="btn btn-secondary" @click="deleteBot">- Delete Bot</button>
  </div>
</template>
