import { Observable } from 'rxjs';
import { cumulate, CumulateOpts, CumulateReturn, Cumulator } from './cumulate';

type SetCons<T = any> = new (values?: readonly T[] | null) => Set<T>;
export function cumulateUnique<T, O extends CumulateOpts<T> = never>(closingNotifier: Observable<any>, options?: O): CumulateReturn<T, SetCons<T>, O> {
    return cumulate(closingNotifier, Set, options);
}

type AA = CumulateReturn<string, SetCons<string>, never>;

class LastValue<T> extends Cumulator<T>{
    public value: T;

    clear() { this.value = undefined; }
    add(value: T) { this.value = value; }
}


type LastValueConst<T> = new () => LastValue<T>;
export function lastValue<T, O extends CumulateOpts<T> = never>(closingNotifier: Observable<any>, options?: O): CumulateReturn<T, LastValueConst<T>, O> {
    return cumulate(closingNotifier, LastValue as LastValueConst<T>, { ...options, toArray: false });
}
