function sum(arr) {
    return arr.reduce((a, b) => a + b, 0);
}

function mean(arr) {
    return sum(arr) / arr.length;
}

function quantile(data, q) {
    const sorted = [...data].sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;

    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        return sorted[base];
    }
}

export default {
    sum,
    mean,
    quantile,
}
