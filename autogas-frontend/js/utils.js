// Small utility functions extracted for testing and reuse
export function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1);
    return rows.map((row, idx) => {
        const cols = row.split(',').map(c => c.trim());
        const obj = {};
        headers.forEach((h, i) => {
            obj[h] = cols[i] === undefined ? '' : cols[i];
        });
        return {
            id: obj.id || `local-${idx}`,
            name: obj.name || obj.title || 'No name',
            description: obj.description || '',
            price: parseFloat(obj.price || obj.cost || 0) || 0,
            imageUrl: obj.imageUrl || obj.image || '',
            category: obj.category || obj.type || 'Boshqalar',
            stockStatus: (obj.stock || obj.stockStatus || '').toLowerCase().includes('out') ? 'out_of_stock' : 'in_stock',
            gradient: obj.gradient || null
        };
    });
}

export function debounce(fn, wait) {
    let t;
    return function(...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
}
