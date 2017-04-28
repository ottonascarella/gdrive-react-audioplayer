const curry = (fn, arity = fn.length) => {

    const curried = (args) => (...more) => {
        const all  = args.concat(more);

        if (all.length < arity) return curried(all);

        return fn(...all);
   };

   return curried([]);

 };

const dropWhile = curry((pred, coll) => {
    let i = 0;
    while (pred(coll[i])) i++;

    return coll.slice(i);
});

const pipe = (first, ...rest) => (
    (...args) => rest.reduce((acc, funk) => funk(acc), first(...args))
);

const compose = (...args) => pipe(...args.reverse());

export {curry, dropWhile, compose};