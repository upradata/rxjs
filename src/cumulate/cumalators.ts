import { Observable } from 'rxjs/src/internal/Observable';
import { cumulate, CumulateOpts, Cumulator } from './cumulate';

export const cumulateUnique = <T, O extends CumulateOpts<T>>(closingNotifier: Observable<any>, options?: O) => {
    return cumulate(closingNotifier, Set, options);
};


class LastValue<T> extends Cumulator<T>{
    public value: T;

    clear() { this.value = undefined; }
    add(value: T) { this.value = value; }
}


export const lastValue = <T, O extends CumulateOpts<T>>(closingNotifier: Observable<any>, options?: O) => {
    return cumulate(closingNotifier, LastValue, { ...options, toArray: false });
};
