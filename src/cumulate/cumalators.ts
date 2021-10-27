import { Observable } from 'rxjs';
import { cumulate, CumulateOpts, CumulateReturn, Cumulator } from './cumulate';

export function cumulateUnique<T>(closingNotifier: Observable<any>): CumulateReturn<T, never>;
// eslint-disable-next-line no-redeclare
export function cumulateUnique<T, O extends CumulateOpts<T>>(closingNotifier: Observable<any>, options?: O): CumulateReturn<T, O> {
    return cumulate<T, O>(closingNotifier, Set, options);
}


class LastValue<T> extends Cumulator<T>{
    public value: T;

    clear() { this.value = undefined; }
    add(value: T) { this.value = value; }
}


export function lastValue<T>(closingNotifier: Observable<any>): CumulateReturn<T, never>;
// eslint-disable-next-line no-redeclare
export function lastValue<T, O extends CumulateOpts<T>>(closingNotifier: Observable<any>, options?: O): CumulateReturn<T, O> {
    return cumulate<T, O>(closingNotifier, LastValue, { ...options, toArray: false });
}
