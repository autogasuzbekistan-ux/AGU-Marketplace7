import { parseCSV, debounce } from '../js/utils.js';

test('parseCSV returns array of objects', () => {
    const csv = `id,name,price,stock\n1,Product A,10,in\n2,Product B,20,out`;
    const res = parseCSV(csv);
    expect(res.length).toBe(2);
    expect(res[0].id).toBe('1');
    expect(res[0].name).toBe('Product A');
    expect(res[1].stockStatus).toBe('out_of_stock');
});

test('debounce delays calls', (done) => {
    let count = 0;
    const inc = () => count++;
    const d = debounce(inc, 100);
    d(); d(); d();
    setTimeout(() => {
        expect(count).toBe(1);
        done();
    }, 250);
});
