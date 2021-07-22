import { Observable } from 'rxjs/src/internal/Observable';
import { Observer } from 'rxjs/src/internal/types';
import { Subscription } from 'rxjs/src/internal/Subscription';
import { Subject } from 'rxjs/src/internal/Subject';
import { Function1 } from '@upradata/util';


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

    private subscribe(observerOrNext: Observer<T> | Function1<T>, error?: Function1<any>, complete?: () => void) {
        const obs = this.observable || this.subject;

        this.subscription = obs.subscribe(typeof observerOrNext === 'function' ? {
            next: observerOrNext,
            error,
            complete
        } : observerOrNext);
    }

    resubscribe(observerOrNext: Observer<T> | Function1<T>, error?: Function1<any>, complete?: () => void) {
        const obs = this.observable || this.subject;

        if (obs === undefined)
            return;

        this.unsubscribe();
        this.subscribe(observerOrNext, error, complete);
    }

    subscribeOnce(observerOrNext: Observer<T> | Function1<T>, error?: Function1<any>, complete?: () => void) {
        const obs = this.observable || this.subject;

        if (obs !== undefined) {
            if (this.subscription === undefined)
                this.subscribe(observerOrNext, error, complete);
        }
    }

    unsubscribe() {
        if (this.subscription !== undefined)
            this.subscription.unsubscribe();
    }
}
