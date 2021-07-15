import { Observable, Operator, Subscriber, TeardownLogic, OperatorFunction } from 'rxjs';
import { subscribeToResult } from 'rxjs/util/subscribeToResult';
import { InnerSubscriber, OuterSubscriber } from 'rxjs/internal-compatibility';
import { PartialRecursive } from '../type';


export abstract class Cumulator<T> {
    abstract clear(): void;
    abstract add(value: T): void;
    toArray?(): T[];
}

export interface CumulatorCtor<T> {
    new(): Cumulator<T>;
}


export class CumulateOptions<T> {
    filter: <T>(value: T) => boolean = value => true;
    toArray: boolean = true;
}

export type CumulateOpts<T> = PartialRecursive<CumulateOptions<T>>;

// Inspiried by /home/milottit/GithubProjects/rxjs/src/internal/operators/buffer.ts
export function cumulate<T, U = T[]>(closingNotifier: Observable<any>, cumulator: CumulatorCtor<T> | Cumulator<T>, options?: CumulateOpts<T>): OperatorFunction<T, U> {
    return function operator(source: Observable<T>): Observable<U> {
        return source.lift(new class UniqueBufferOperator<T> implements Operator<T, U> {
            call(subscriber: Subscriber<U>, source: any): TeardownLogic {
                return source.subscribe(new BufferSubscriber({ destination: subscriber, closingNotifier, cumulator, options }));
            }
        });
    };
}




class BufferSubscriber<T, U = T[]> extends OuterSubscriber<T, any> {

    cumulator: Cumulator<T>;
    options: CumulateOptions<T>;

    constructor(args: {
        destination: Subscriber<U>; closingNotifier: Observable<any>;
        cumulator: CumulatorCtor<any> | Cumulator<any>;
        options?: CumulateOpts<T>;
    }) {
        super(args.destination);
        const { cumulator, closingNotifier } = args;
        this.options = Object.assign(new CumulateOptions(), args.options);

        this.cumulator = cumulator instanceof Cumulator ? cumulator : new cumulator();
        this.add(subscribeToResult(this, closingNotifier));
    }

    protected _next(value: T) {
        if (this.options.filter(value))
            this.cumulator.add(value);
    }

    notifyNext(outerValue: T, innerValue: any, outerIndex: number, innerIndex: number, innerSub: InnerSubscriber<T, any>): void {
        const cumulate = this.options.toArray ?
            this.cumulator[ Symbol.iterator ] ? [ ...this.cumulator[ Symbol.iterator ]() ] : this.cumulator.toArray() :
            this.cumulator;

        this.cumulator.clear();

        this.destination.next(cumulate);
    }
}


export const cumulateUnique = <T>(closingNotifier: Observable<any>, options?: CumulateOpts<T>) => cumulate<T>(closingNotifier, Set, options);


class LastValue<T> extends Cumulator<T>{
    public value: T;

    clear() { this.value = undefined; }
    add(value: T) { this.value = value; }
}

export const lastValue = <T>(closingNotifier: Observable<any>, options?: CumulateOpts<T>) => cumulate<T>(closingNotifier, LastValue, { ...options, toArray: false });
