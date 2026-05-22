export default defineNuxtRouteMiddleware((to) => {
    const { requireUserAuth } = useAuth()
    requireUserAuth(to)
})