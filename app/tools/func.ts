import { v4 } from 'uuid';


//function to make id
export const makeID = () => {
	return v4();
};

//Checks pwd and email characters
export const checkpwd = (strr : string) => {
	  const len = strr.length;
	  if (len > 50) {
		  return false;
	  }
	  const otherChx = `~!@#%&_{}[].;<>abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890`;
	  for (let i = 0; i < len; i++) {
		  if (!(otherChx.includes(strr[i]))) {
			  return false;
		  }
	  }
	  return true;
  };

  //function to check input datathat is only number
export const checknumber = (strr: string) => {
	const len = strr.length;
	if (len > 50) {
		return false;
	}
	const num = `1234567890`;
	for (let i = 0; i < len; i++) {
		if (!(num.includes(strr[i]))) {
			return false;
		}
	}
	return true;
};

  export const findLongestWord = (str: string) => {
  // 1. Split the string by spaces to get an array of words
  const words = str.split(' ');

  // 2. Initialize variables to keep track of the longest word found so far
  let longestWord = '';
  let maxLength = 0;
  if (words.length === 1) {
    return words[0];
  }

  // 3. Iterate over the array of words
  for (let i = 0; i < words.length; i++) {
    const currentWord = words[i];

    // 4. Compare the length of the current word with the maximum length found
    if (currentWord.length > maxLength) {
      maxLength = currentWord.length; // Update maxLength
      longestWord = currentWord;      // Update longestWord
    }
  }

  // 5. Return the longest word
  return longestWord;
}

