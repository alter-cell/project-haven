const routes = new Map();
let currentRoute = "library";

export function registerRoute(name, enter) {
  routes.set(name, enter);
}

export function navigate(name, payload) {
  currentRoute = name;
  routes.get(name)?.(payload);
  window.dispatchEvent(new CustomEvent("petal:route", { detail: { name, payload } }));
}

export const getRoute = () => currentRoute;
