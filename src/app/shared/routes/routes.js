export const ROUTES = {
    dashboard: "/dashboard",
    bahan: "/bahan",
    product: "/product",
    BoM: "/BoM",
    detailBoM: (reference) => `/BoM/${reference}`,
    order: "/order",
    detailOrder: (orderID) => `/order/${orderID}`,
    
}

