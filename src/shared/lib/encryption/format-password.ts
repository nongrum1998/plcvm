import CryptoJS from 'crypto-js';

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function formatPassword(password: string): string {
  const random = ['a', 'b', 'c', 'd', 'e', 'f', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const randomSep = ['z', 'y', 'x', 'u', 'v', 'm'];

  const salt: (number | string)[] = [];

  const hash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);

  const pwd = hash.split('');

  for (let i = 0; i < 20; i++) {
    const j = i <= 3 ? i : randomBetween(4, 63);

    const temp = pwd[j];

    pwd[j] = random[Math.floor(Math.random() * random.length)];

    salt.push(j, temp, randomSep[Math.floor(Math.random() * randomSep.length)]);
  }

  const result = pwd.join('') + salt.join('');

  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(result));
}
