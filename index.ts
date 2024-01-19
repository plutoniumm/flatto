const objects = await Bun.file('rand.json').json();

// obj -> flat array w/first row as struct
function encode (obj_arr: any[]) {
  if (typeof obj_arr[0] !== 'object') {
    console.error('must be array of objects');
    return obj_arr
  }
  let struct = Object.keys(obj_arr[0])
  let values = new Array(obj_arr.length)
  for (let i = 0; i < obj_arr.length; i++) {
    values[i] = new Array(struct.length)
    for (let j = 0; j < struct.length; j++) {
      values[i][j] = obj_arr[i][struct[j]]
    }
  }

  return JSON.stringify([struct, values])
}

// using the proxy object to make .key access easy per object
class FO {
  keys: string[];
  data: any[][];
  constructor(string: string) {
    let obj;
    try {
      obj = JSON.parse(string)
    } catch (e) {
      console.error(e);
      return
    }
    // typecheck for first one being strings only, and rest having same length as first
    let [struct, values] = obj;
    if (struct.some((x: any) => typeof x !== 'string')) {
      console.error('struct must be strings');
      return
    }
    let valid = true;
    for (let i = 0; i < values.length; i++) {
      if (values[i].length !== struct.length) {
        valid = false;
        break;
      }
    }
    if (!valid) {
      console.error('values must have same length as struct');
      return
    }

    // create proxy object to return [n].key as shortcut to [n][index_of key]
    this.keys = struct;
    this.data = values;
  }

  get (index: number, key?: string) {
    if (!key) {
      const obj = {};
      for (let i = 0; i < this.keys.length; i++) {
        obj[this.keys[i]] = this.data[index][i];
      }
      return obj;
    } else {
      const i = this.keys.indexOf(key);
      if (i === -1) {
        console.error('key not found');
        return
      }
      return this.data[index][i];
    }
  }

  set (index: number, key: string, value: any) {
    const i = this.keys.indexOf(key);
    if (i === -1) {
      console.error('key not found');
      return
    }
    this.data[index][i] = value;
  }

  setAll (index: number, obj: any) {
    if (!this.data[index]) {
      this.data[index] = new Array(this.keys.length);
    }
    for (let i = 0; i < this.keys.length; i++) {
      this.data[index][i] = obj[this.keys[i]];
    }
  }
}

// testing
const raw = JSON.stringify(objects);
const converted = encode(objects);

console.log(`Raw: ${raw.length}, Converted: ${converted.length}\n\tSaved ${(raw.length - converted.length) / raw.length * 100}%`);

console.log(converted);

const fo = new FO(converted);
console.log(fo.get(1));
console.log(fo.get(1, 'name'));