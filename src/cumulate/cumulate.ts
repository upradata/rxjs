import { Observable } from 'rxjs/src/internal/Observable';
import { OperatorFunction } from 'rxjs/src/internal/types';
import { operate } from 'rxjs/src/internal/util/lift';
import { noop } from 'rxjs/src/internal/util/noop';
import { OperatorSubscriber } from 'rxjs/src/internal/operators/OperatorSubscriber';

// Inspiried by rxjs/node_modules/.pnpm/rxjs@7.2.0/node_modules/rxjs/src/internal/operators/buffer.ts


export abstract class Cumulator<T> {
    abstract clear(): void;
    abstract add(value: T): void;
    toArray?(): T[];
}


export type CumulatorCtor<T> = new () => Cumulator<T>;


export class CumulateOptions<T> {
    filter: (value: T) => boolean = _value => true;
    toArray: boolean = true;
}

export type CumulateOpts<T> = Partial<CumulateOptions<T>>;

export type Return<T, O extends CumulateOpts<T>> = O[ 'toArray' ] extends true ? T[] : Cumulator<T>;


/**
 * Cumulates the source Observable values until `closingNotifier` emits.
 *
 * <span class="informal">Collects values from the past in a Cumulator, and emits
 * this cumulator or copies it as an "array" only when another Observable emits.</span>
 *
 * ![](cumulate.png)
 *
 * Cumulates the incoming Observable values until the given `closingNotifier`
 * Observable emits a value, at which point it emits the cumulator/array on the output
 * Observable and restart the cumulator internally (calling cumulator.clean()), awaiting the next time
 * `closingNotifier` emits.
 *
 * ## Example
 *
 * On every click, emit array of most recent interval events
 *
 * ```ts
 * import { fromEvent, interval } from 'rxjs';
 * import { buffer } from 'rxjs/operators';
 * 
 * export const cumulateUnique = <T, O extends CumulateOpts<T>>(closingNotifier: Observable<any>, options?: O) => {
 *   return cumulate(closingNotifier, Set, options);
 * };
 * 
 * const clicks = fromEvent(document, 'click');
 * const intervalEvents = interval(1000);
 * const cumulateSet = intervalEvents.pipe(tap(t => t % 4), cumulateUnique(clicks, { toArray: true }));
 * cumulateSet.subscribe(x => console.log(x)); => [0, 1, 2, 3] (if we wait at least 4s, otherwise [0, 1] for 2s for instance)
 * ```
 *
 * @see {@link cumulateUnique}
 * @see {@link lastValue}
 * @see {@link bufferToggle}
 *
 * @param {Observable<any>} closingNotifier An Observable that signals the
 * buffer to be emitted on the output Observable.
 * @param {CumulatorCtor<T> | Cumulator<T>} cumulator A cumulator instance or Constructor
 * @param {CumulateOpts<T>} options cumulate options
 * @return A function that returns an Observable of buffers, which are arrays
 * of values.
 */

export const cumulate = <T, O extends CumulateOpts<T>>(closingNotifier: Observable<any>, cumulator: CumulatorCtor<T> | Cumulator<T>, options?: O): OperatorFunction<T, Return<T, O>> => {

    const newCumulator = () => {
        if (cumulator instanceof Cumulator) {
            cumulator.clear();
            return cumulator;
        }

        return new cumulator();
    };

    const getResult = (buffer: Cumulator<T>): T[] | Cumulator<T> => {
        if (options.toArray) {
            if (buffer[ Symbol.iterator ])
                return [ ...buffer[ Symbol.iterator ]() ] as T[];

            return buffer.toArray();
        }

        return buffer;
    };


    let kumulator = newCumulator();


    return operate((source, subscriber) => {

        // Subscribe to our source.
        source.subscribe(
            new OperatorSubscriber(
                subscriber,
                value => kumulator.add(value),
                () => {
                    subscriber.next(getResult(kumulator) as Return<T, O>);
                    subscriber.complete();
                }
            )
        );

        // Subscribe to the closing notifier.
        closingNotifier.subscribe(
            new OperatorSubscriber(
                subscriber,
                () => {
                    // Start a new kumulator and emit the previous one.

                    const result = getResult(kumulator);
                    kumulator.clear();

                    subscriber.next(result as Return<T, O>);
                },
                noop
            )
        );

        return () => {
            // Ensure buffered values are released on teardown.
            kumulator = null;
        };
    });
};
