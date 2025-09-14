<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
<template>
  <div class="w-screen h-screen p-4 box-border flex flex-col">
    <button @click="router.go(-1)" class="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
      返回
    </button>
    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 flex-1 overflow-auto"
    >
      <div v-for="i in 13" :key="i" class="flex flex-col items-center">
        <div class="w-full aspect-square pointer-none:">
          <DsModelBox />
        </div>
        <div class="mt-2 text-center text-gray-800 text-sm">萧</div>
      </div>
    </div>
  </div>
</template>
