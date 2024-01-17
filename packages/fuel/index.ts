import Account, {base64ToHex} from "authn-sign";
import {Predicate, Provider} from "fuels";

import buildPredicate from "./predicate";

type AccountParams = {
    username?: string;
    provider: string;
}

export type PredicateAccount = {
    predicate: Predicate<any>,
    account: Account,
}

const makeFunctionReturn = (account: Account, predicate: Predicate<any>) => ({
    account,
    predicate,
    fuelAddress: predicate.address.toString(),
})

const randomUserName = () => `account_${Math.floor(Math.random() * 10000)}`;

function recoverAccountByNumber(acoount: Account, value = 0) {
    return new Account(
        randomUserName(),
        base64ToHex(acoount.id),
        //@ts-ignore
        '0x04' + acoount.recovered['publicKey' + value].slice(2),
    );
}

async function createAccount({username = randomUserName(), provider}: AccountParams) {
    const account = await Account.create(username);
    const predicate = buildPredicate(
        await Provider.create(provider),
        await account.address()
    )
    return {
        account,
        predicate,
        fuelAddress: predicate.address.toString(),
    };
}

async function recoverAccountByParams(id: string, pulicKey: string, { username = randomUserName(), provider }: AccountParams) {
    const account = new Account(username, id, pulicKey);
    const predicate = buildPredicate(
        await Provider.create(provider),
        await account.address()
    )
    return makeFunctionReturn(account, predicate);
}

async function recoverAccount({username = randomUserName(), provider}: AccountParams) {
    const recover = await (new Account()).sign('0x84', { recover: true });
    const _provider = await Provider.create(provider);

    debugger;
    const predicate0 = buildPredicate(_provider, recover.recovered.address0);
    const predicate1 = buildPredicate(_provider, recover.recovered.address1);

    const balance_0 = await predicate0.getBalance();
    const balance_1 = await predicate1.getBalance();

    // If account 0 has a history, pick that one.
    if (parseFloat(balance_0.format()) > 0 && parseFloat(balance_1.format()) == 0) {
        return makeFunctionReturn(recoverAccountByNumber(recover, 0), predicate0)
    }

    // If account 1 has a history, pick that one.
    if (parseFloat(balance_1.format()) > 0 && parseFloat(balance_0.format()) == 0) {
        return makeFunctionReturn(recoverAccountByNumber(recover, 1), predicate1)
    }

    // Try account 0.
    const testAccount = new Account(
        username,
        base64ToHex(recover.id),
        '0x04' + recover.recovered['publicKey' + '0'].slice(2),
    );

    // Test account 0 for signing, if it fails, then we go to account 1.
    try {
        // If this works, then all good for account 0.
        await testAccount.sign('0x84');

        // Recover account 0.
        return makeFunctionReturn(recoverAccountByNumber(recover, 0), predicate0)
    } catch (error) {
        return makeFunctionReturn(recoverAccountByNumber(recover, 1), predicate0)
    }
}

export {createAccount, recoverAccount, recoverAccountByParams};
