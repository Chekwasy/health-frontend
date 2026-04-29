import { adding } from "./adding";

export const multiply = (fst: string, snd: string) => {
    let str1 = '';
    let str2 = '';
        if (parseInt((parseFloat(fst) * 100).toString()) >= parseInt((parseFloat(snd) * 100).toString())) {
                str1 = parseInt((parseFloat(fst) * 100).toString()).toString();
                str2 = parseInt((parseFloat(snd) * 100).toString()).toString();
        } else {
                str2 = parseInt((parseFloat(fst) * 100).toString()).toString();
                str1 = parseInt((parseFloat(snd) * 100).toString()).toString();
        }
    const ln1 = str1.length;
    const ln2 = str2.length;
    let mul = '';
    let rem = '';
    if (ln1 >= ln2) {
            for (let i = ln2 - 1; i >= 0; i--) {
                    for (let j = (ln1 - 1); j >= 0; j--) {
                            let m = parseInt(str2[i]) * parseInt(str1[j]);
                            if (rem !== '') {
                                    m = m + parseInt(rem);
                                    rem = '';
                            }
                            if (m.toString().length === 1) {
                                    mul = m.toString() + mul;
                            } else if (m.toString().length > 1) {
                                    mul = m.toString()[1] + mul;
                                    rem = m.toString()[0];
                            }
                            if (j === 0 && rem !== '') {
                                    mul = rem + mul;
                rem = '';
                            }
                    }
                    mul = '_' + mul;
            }
    }
	const addlst = mul.slice(1).split('_');
	const addln = addlst.length;
	let zeros = '';
	let ans = '0';
	const nwadd = [];
	if (addln > 1) {
		for (let i = 0; i < (addln - 1); i++) {
			zeros = zeros + '0';
		}
		for (let i = 0; i < addln; i++) {
                        nwadd.push(addlst[i] + zeros);
			zeros = zeros.slice(1);
                }
	    nwadd.forEach((itm) => {
		    if (ans.length >= itm.length) {
			    ans = adding(ans, itm);
		    }
		    if (ans.length < itm.length) {
			    ans = adding(itm, ans);
	    	}
	    });
	    let half = (parseFloat('.' + ans.slice(-4)).toFixed(2)).slice(-3);
	    if (half[2] === '0' && half[1] === '0') {
		    half = '';
	    } else if (half[2] === '0') {
		    half = half.slice(0, -1);
	    }
	    return ans.slice(0, -4) + half;
	}
	let half = (parseFloat('.' + addlst[0].slice(-4)).toFixed(2)).slice(-3);
	if (half[2] === '0' && half[1] === '0') {
		half = '';
	} else if (half[2] === '0') {
		half = half.slice(0, -1);
	}
	return addlst[0].slice(0, -4) + half;
};
