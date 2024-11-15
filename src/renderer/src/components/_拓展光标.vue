<script setup lang="ts">
import { ref, watch, computed, reactive, useTemplateRef, onMounted } from 'vue'
import {
  useElementBounding,
  useElementByPoint,
  useMouse,
  useEventListener,
  useIdle
} from '@vueuse/core'

const 拓展光标 = useTemplateRef('拓展光标')
const { x: 鼠标坐标X, y: 鼠标坐标Y } = useMouse({
  type: 'client'
})
const 拓展鼠标模式 = ref(false)
const X偏移阈值 = ref(40)
const Y偏移阈值 = ref(30)
const X拓展距离 = ref(300)
const Y拓展距离 = ref(300)
const 目标偏移X = ref(0)
const 目标偏移Y = ref(0)
const x = ref(0)
const y = ref(0)
const { idle: 静止状态 } = useIdle(2 * 100)

const { element } = useElementByPoint({ x, y })
const bounding = reactive(useElementBounding(element))

const 偏移计算 = (原始偏移: number, 阈值: number, 拓展距离: number) => {
  if (原始偏移 <= -阈值) return -拓展距离
  if (原始偏移 >= 阈值) return 拓展距离
  return 0
}

const 坐标计算 = (原坐标: number, 偏移: number, 最小值: number, 最大值: number) => {
  const 最终坐标 = 原坐标 + 偏移
  return Math.max(最小值, Math.min(最大值, 最终坐标))
}

watch(静止状态, () => {
  if (拓展鼠标模式.value && 静止状态.value) {
    element.value?.click?.()
  }
})

watch(element, () => {
  if (
    element.value instanceof SVGElement ||
    element.value instanceof SVGPathElement ||
    element.value instanceof SVGSVGElement ||
    element.value instanceof HTMLSpanElement
  ) {
    element.value = element.value.parentElement
  }
})

const 选中样式 = computed(() => {
  const time = bounding.width > 300 || bounding.height > 300 ? 0.25 : 0.1
  const same = {
    width: `${bounding.width}px`,
    height: `${bounding.height}px`,
    transform: `translate(calc(${bounding.left}px), calc(${bounding.top}px))`
  }
  if (拓展鼠标模式.value && element.value) {
    return { ...same, opacity: 1, transition: `all ${time}s ease-out` }
  }
  return { ...same, opacity: 0, transition: `none` }
})

const 点样式 = computed(() => {
  if (拓展鼠标模式.value) {
    const 最终坐标X = 坐标计算(鼠标坐标X.value, 目标偏移X.value, 0, window.innerWidth - 20)
    const 最终坐标Y = 坐标计算(鼠标坐标Y.value, 目标偏移Y.value, 0, window.innerHeight - 10)
    return {
      opacity: 1,
      transform: `translate(calc(${最终坐标X}px), calc(${最终坐标Y}px))`
    }
  }
  return {
    opacity: 0
  }
})

const handleRightDown = (downEvent: MouseEvent) => {
  if (downEvent.button == 2) {
    const startX = 鼠标坐标X.value
    const startY = 鼠标坐标Y.value
    x.value = 鼠标坐标X.value
    y.value = 鼠标坐标Y.value
    let moveX = 0
    let moveY = 0
    let absMoveX = 0
    let absMoveY = 0
    setTimeout(() => {
      if (!拓展鼠标模式.value) {
        moveX = 鼠标坐标X.value - startX
        moveY = 鼠标坐标Y.value - startY
        absMoveX = Math.abs(moveX)
        absMoveY = Math.abs(moveY)
      }
    }, 100)

    const extendCursorClick = (e: KeyboardEvent) => {
      if (拓展鼠标模式.value && e.key == 'Alt') element.value?.click?.()
    }

    const handleMouseMove = () => {
      拓展鼠标模式.value = absMoveX > X偏移阈值.value || absMoveY > Y偏移阈值.value

      if (拓展鼠标模式.value) {
        const rect = 拓展光标.value?.getBoundingClientRect()

        x.value = rect?.x || 鼠标坐标X.value
        y.value = rect?.y || 鼠标坐标Y.value

        目标偏移X.value = 偏移计算(moveX, X偏移阈值.value, X拓展距离.value)
        目标偏移Y.value = 偏移计算(moveY, Y偏移阈值.value, Y拓展距离.value)
      }
    }

    const handleMouseUp = () => {
      if (拓展鼠标模式.value) element.value?.click?.()
      拓展鼠标模式.value = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('keydown', extendCursorClick)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('keydown', extendCursorClick)
    document.addEventListener('mouseup', handleMouseUp)
  }
}

onMounted(() => {
  useEventListener(document, 'mousedown', handleRightDown, true)
})

defineOptions({
  name: 'ExtendCursor'
})
</script>
<template>
  <div
    :style="[
      {
        borderRadius: '5px',
        pointerEvents: 'none',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 99999,
        backgroundColor: '#3eaf7c44'
      },
      选中样式
    ]"
  />
  <div
    ref="拓展光标"
    :style="[
      点样式,
      {
        position: 'fixed',
        pointerEvents: 'none',
        borderRadius: '50%',
        width: '10px',
        height: '10px',
        left: 0,
        top: 0,
        background: 'red',
        zIndex: 99999
      }
    ]"
  ></div>
</template>
