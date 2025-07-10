export const routeChecker = (route: string): string => {
  const invalidRouteNameMessage =
    `Invalid route name "${route}". ` +
    'Allowed characters: alphanumeric, hyphen, dot, underscore, tilde.'
  route = route?.replace(/(^\/+|\/+$)/g, '') || '' // remove leading and trailing slashes
  if (RegExp(/[^a-zA-Z0-9-._~]/).test(route)) throw new Error(invalidRouteNameMessage)
  return '/' + route
}
