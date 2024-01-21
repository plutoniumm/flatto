// obj -> flat array w/first row as struct
export function encode (obj_arr: any[]) {
  if (typeof obj_arr[0] !== 'object') {
    // @ts-ignore
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

// flat array w/first row as struct -> obj
export function restore (obj: any) {
  if (typeof obj === 'string') {
    // i dont mind if this throws
    // that should in fact be the case
    obj = JSON.parse(obj);
  }
  let [struct, values] = obj;
  let restored = new Array(values.length);
  for (let i = 0; i < values.length; i++) {
    restored[i] = {};
    for (let j = 0; j < struct.length; j++) {
      restored[i][struct[j]] = values[i][j];
    }
  }

  return restored;
};

// using the proxy object to make .key access easy per object
class FO {
  keys: string[] = [];
  data: any[][] = [];
  constructor(string: string) {
    // this should throw if invalid
    let obj = JSON.parse(string)
    // typecheck for first one being strings only, and rest having same length as first
    let [struct, values] = obj;
    if (struct.some((x: any) => typeof x !== 'string')) {
      throw new Error('struct must be array of strings');
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
      // @ts-ignore
      console.error('values must have same length as struct');
      return
    }

    // create proxy object to return [n].key as shortcut to [n][index_of key]
    this.keys = struct;
    this.data = values;
  }

  // TODO: add where function
  // find all where key === value|condition
  // returns struct[]
  // where (key: string, value: any | Function) {
  //   const i = this.keys.indexOf(key);
  //   if (i === -1) {
  //     console.error('key not found');
  //     return
  //   }

  //   const arr = [];
  //   // if for is better than forif, reduces branching
  //   if (typeof value === 'function') {
  //     for (let i = 0; i < this.data.length; i++) {
  //       if (value(this.data[i][i])) {
  //         arr.push(this.data[i]);
  //       }
  //     }
  //   } else {
  //     for (let i = 0; i < this.data.length; i++) {
  //       if (this.data[i][i] === value) {
  //         arr.push(this.data[i]);
  //       }
  //     }
  //   }
  //   return arr;
  // }

  get (index: number, key?: string) {
    if (!key) {
      const obj: any = {};
      for (let i = 0; i < this.keys.length; i++) {
        obj[this.keys[i]] = this.data[index][i];
      }
      return obj;
    } else {
      const i = this.keys.indexOf(key);
      if (i === -1) {
        return null;
      }
      return this.data[index][i];
    }
  }

  set (index: number, key: string, value: any) {
    const i = this.keys.indexOf(key);
    if (i === -1) {
      throw new Error('key not found');
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
};

export const decode = (string: string) => new FO(string);

export default {
  encode,
  decode,
  restore
}