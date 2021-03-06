﻿/// <reference path="../utils/prim.ts" />

module DotnetJs.Collections {

    export interface IDictionary<TKey, TValue> extends IEnumerable<KeyValuePair<TKey, TValue>> {
        readonly Count: number;
        readonly Keys: TKey[];
        readonly KeyValuePairs: KeyValuePair<TKey, TValue>[];
        readonly Values: TValue[];
        GetValue(key: TKey): TValue;
        SetValue(key: TKey, value: TValue): void;
        Add(key: TKey, value: TValue): void;
        Clear(): void;
        Contains(keyValuePair: KeyValuePair<TKey, TValue>): boolean;
        ContainsKey(key: TKey): boolean;
        ContainsValue(value: TValue): boolean;
        ForEach(action: (item: KeyValuePair<TKey, TValue>) => void): void;
        Remove(key: TKey): TValue;
        TryGetValue(key: TKey, out: OutParam<TValue>): boolean;
    }

    export interface IEnumerator<T> extends IDisposable {
        readonly Current: T;
        MoveNext(): boolean;
        Reset(): void;
    }

    export interface IEnumerable<T> {
        GetEnumerator(): IEnumerator<T>;
    }

    export interface ICollection<T> extends IEnumerable<T> {
        readonly Count: number;
        readonly IsReadOnly: boolean;
        Add(item: T): void;
        Clear(): void;
        Contains(item: T): boolean;
        CopyTo(array: T[], arrayIndex: number): void;
        Remove(item: T): boolean;
    }

    export type KeyValuePair<TKey, TValue> = {
        Key: TKey;
        Value: TValue;
    }

    export class KeyNotFoundException extends Error {
        constructor(key: any) {
            super('The given key was not present in the dictionary, key: ' + key.toString());
            this.stack = (new Error()).stack;
            this.name = 'KeyNotFoundException';
        }
    }
}
