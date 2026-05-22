export default defineNuxtRouteMiddleware((to) => {
    const { requireOrganizationAuth } = useAuth()
    requireOrganizationAuth(to)
})