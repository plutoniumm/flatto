import { encode, decode, restore } from './index';

const objects = await Bun.file('data.json').json();

// testing
const raw = JSON.stringify(objects);
const converted = encode(objects);

console.log(`Raw: ${raw.length}, Converted: ${converted.length}\n\tSaved ${(raw.length - converted.length) / raw.length * 100}%`);

const fo = decode(converted);
console.log(fo.get(0));
console.log(fo.get(0, 'title'));

const restored = restore(converted);
console.log(restored);