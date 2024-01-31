function isPalindrome(x) {
  const xString = x.toString();

  if (xString.length < 2) {
    return true;
  }

  const string = formatToEvenStringLength(xString);

  let result = false;

  for (let i = 0; i < string.length; i++) {
    const j = string.length - 1 - i;

    if (i > j) {
      result = true;
      break;
    }

    if (string[i] !== string[j]) {
      result = false;
      break;
    }
  }

  return result;
}

const formatToEvenStringLength = (string) => {
  const isOdd = Boolean(string.length % 2);

  return isOdd
    ? removeCharAt(string, Math.ceil(string.length / 2) - 1)
    : string;
};

const removeCharAt = (string, index) => {
  const array = string.split('');

  array.splice(index, 1);

  return array.join('');
};
