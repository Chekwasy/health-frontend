export const adding = (fst: string, snd: string) => {
        const ln1 = fst.length;
        const ln2 = snd.length;
        let snd2 = '';
        let addval = '';
        let rem = '';
        let z = '';
        if (ln1 > ln2) {
                const df = ln1 - ln2;
                for (let i = 0; i < df; i++) {
                        z = z + '0';
                }
                snd2 = z + snd;
        } else {
                snd2 = snd;
        }
        for (let i = ln1 - 1; i >= 0; i--) {
                let a = 0;
                a = parseInt(fst[i]) + parseInt(snd2[i]);
                if (rem !== '') {
                        a = a + parseInt(rem);
                        rem = '';
                }
                if (a.toString().length === 1) {
                        addval = a.toString() + addval;
                }
                if (a.toString().length > 1) {
                        addval = a.toString()[1] + addval;
                        rem = a.toString()[0];
                }
                if (i === 0 && rem !== '') {
                        addval = rem + addval;
                        rem = '';
                }
        }
        return addval
};
