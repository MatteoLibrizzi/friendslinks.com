
export function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export function formatNumber(num: number): string {
    return num.toFixed(2)
}