### flatto
literally just flat objects

```ts
import { encode, decode, restore } from 'flatto';

interface Something {
  name: string;
  age: number;
  street: [string, number];
  city: string;
}

const structs: Something[] = [
  // {some stuff 1, name: "Tom"}
  // {some stuff 2}
]

// this object is about 20-25% smaller than the orig
// for large objects only. if len <3, no point
// this is done so that it can be sent over the wire
// if you're already in memory dont do this, cost > benefit
const encoded: string = encode(structs);

// client side
const decoded = decode(encoded)
decoded.get(0, 'name') // gives back "Tom"

const restored = restore(decoded)
// orig back [{some stuff 1, name: "Tom"}, ...]
```

### Todo
```ts
const result = decoded.where(key, value|condition);
```