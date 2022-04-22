<script setup lang="ts">
import service from '~/common/services/http'
import { token } from '~/common/stores'

const router = useRouter()
const { t } = useI18n()

const loginLoading = ref(false)
onMounted(() => {
  if (token.value?.length)
    router.push({ name: 'dashboard' })
})
interface FormState {
  username: string
  password: string
}
const formState = reactive<FormState>({
  username: 'amine94',
  password: '98565618Am',
})
const onFinish = async(values: any) => {
  loginLoading.value = true
  const { data } = await service.post('/api/auth/login', values)

  if (data) {
    token.value = data.token
    router.push({ name: 'dashboard' })
  }

  loginLoading.value = false
}

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo)
}
const disabled = computed(() => {
  return !(formState.username && formState.password)
})
</script>

<template>
  <div class="flex items-center min-h-screen p-6 bg-gray-200 dark:bg-gray-900">
    <div class="flex-1 relative h-full max-w-3xl mx-auto overflow-hidden bg-white rounded-md shadow-md shadow-gray-100/10">
      <div class="flex flex-col overflow-y-auto md:flex-row">
        <div class="h-32 md:h-auto md:w-2/5">
          <img aria-hidden="true" class="object-cover w-full h-full dark:hidden" src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1774&q=80" alt="Office">
          <img aria-hidden="true" class="hidden object-cover w-full h-full dark:block" src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1774&q=80" alt="Office">
        </div>
        <div class="flex items-center justify-center p-6 sm:p-12 md:w-3/5">
          <div class="w-full">
            <div class="absolute top-2 right-2">
              <DarkSwitch />
            </div>
            <h1 class="mb-4 text-3xl font-semibold text-gray-700 dark:text-gray-700">
              Login
            </h1>
            <div>
              <a-form
                layout="vertical"
                :model="formState"
                name="normal_login"
                class="login-form"
                @finish="onFinish"
                @finish-failed="onFinishFailed"
              >
                <a-form-item
                  label="Username"
                  name="username"
                  :rules="[{ required: true, message: 'Please input your username!' }]"
                >
                  <a-input v-model:value="formState.username" size="large">
                    <template #prefix>
                      <span class="i-ph-user-duotone site-form-item-icon" />
                    </template>
                  </a-input>
                </a-form-item>

                <a-form-item
                  label="Password"
                  name="password"
                  :rules="[{ required: true, message: 'Please input your password!' }]"
                >
                  <a-input-password v-model:value="formState.password" size="large">
                    <template #prefix>
                      <span class="i-ph-lock-duotone site-form-item-icon" />
                    </template>
                  </a-input-password>
                </a-form-item>

                <div class="login-form-wrap">
                  <a-form-item name="remember" no-style>
                    <a-checkbox>
                      <span class="text-dark-800">
                        Remember me
                      </span>
                    </a-checkbox>
                  </a-form-item>
                  <a class="login-form-forgot" href="">Forgot password</a>
                </div>

                <a-form-item class="!my-2">
                  <a-button :loading="loginLoading" size="large" block :disabled="disabled" type="primary" html-type="submit" class="">
                    Log in
                  </a-button>
                </a-form-item>
              </a-form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: none
</route>
