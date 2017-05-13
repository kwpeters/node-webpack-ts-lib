import {random} from "lodash";

export class Person {

    private _firstName: string;
    private _lastName: string;

    constructor(firstName: string, lastName: string) {
        this._firstName = firstName;
        this._lastName = lastName;
    }

    public speak(): string {
        return `Hello, my name is ${this._firstName} ${this._lastName}`;
    }

    public random(): number {
        return random(1, 10);
    }

}
