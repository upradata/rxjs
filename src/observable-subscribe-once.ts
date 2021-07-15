import { Observable, Observer, Subscription, Subject } from 'rxjs';

export type Function1Arg<T, R = void> = (arg: T) => R;

export class ObservableSubscribeOnce<T> {
    private subscription: Subscription;
    public observable?: Observable<T>;
    public subject?: Subject<T>;

    constructor(observableOrSubject?: Observable<T> | Subject<T>) {
        if ((observableOrSubject as any).next !== undefined)
            this.subject = observableOrSubject as Subject<T>;
        else
            this.observable = observableOrSubject;
    }

    resubscribe(observerOrNext: Observer<T> | Function1Arg<T>, error?: Function1Arg<any>, complete?: () => void) {
        const obs = this.observable || this.subject;

        if (obs === undefined)
            return;

        this.unsubscribe();
        this.subscription = obs.subscribe(observerOrNext as any, error, complete);
    }

    subscribeOnce(observerOrNext: Observer<T> | Function1Arg<T>, error?: Function1Arg<any>, complete?: () => void) {
        const obs = this.observable || this.subject;

        if (obs !== undefined) {
            if (this.subscription === undefined)
                this.subscription = obs.subscribe(observerOrNext as any, error, complete);
        }
    }

    unsubscribe() {
        if (this.subscription !== undefined)
            this.subscription.unsubscribe();
    }
}
