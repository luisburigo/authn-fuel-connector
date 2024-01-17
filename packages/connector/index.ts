import {FuelConnector, FuelWalletProvider} from "@fuel-wallet/sdk";
import {createAccount, PredicateAccount, recoverAccount, recoverAccountByParams} from "@webauthn/fuel";

const ACCOUNT_STORAGE_KEY = '@webauthn/account';
const PROVIDER_URL = 'https://beta-4.fuel.network/graphql';

class WebauthnConnector extends FuelConnector {
    name = 'Webauthn';
    metadata = {
        image: '',
        install: {
            action: 'Not found',
            link: 'Not found',
            description: 'Not found',
        },
    };

    installed = true;
    connected = false;

    private account?: PredicateAccount;

    constructor(private provider: string = PROVIDER_URL) {
        super();
    }

    async connect() {
        try {
            this.account = await recoverAccount({
                provider: this.provider,
            })
        } catch (e) {
            this.account = await createAccount({
                provider: this.provider,
            });
        }

        localStorage.setItem(
            ACCOUNT_STORAGE_KEY,
            JSON.stringify([
                this.account.account.id,
                this.account.account.publicKey,
            ])
        );

        this.connected = true;
        return true;
    }

    async ping() {
        return true;
    }

    async version() {
        return {
            app: '0.0.1',
            network: '>=0.12.4',
        };
    }

    async signMessage(_: string, message: string) {
        if (!this.account) {
            throw new Error('Sign message error');
        }

        const signature = await this.account.account.sign(message);
        return signature.normalized;
    }

    async isConnected() {
        await this.updateAccount();

        if (this.account && !this.connected) {
            this.connected = true;
        }

        return this.connected;
    }

    async accounts() {
        await this.updateAccount();

        if (!this.account) {
            throw new Error('Accounts error');
        }

        return [this.account.predicate.address.toString()]
    }

    async currentAccount() {
        await this.updateAccount();

        if (!this.account) {
            throw new Error('Current account error');
        }

        return this.account.predicate.address.toAddress();
    }

    async disconnect() {
        localStorage.removeItem(ACCOUNT_STORAGE_KEY);
        delete this.account;
        this.connected = false;
        return false;
    }

    async currentNetwork() {
        const provider = await FuelWalletProvider.create(this.provider);
        return {
            url: provider.url,
            chainId: provider.getChainId(),
        }
    }

    private async updateAccount() {
        const account = localStorage.getItem(ACCOUNT_STORAGE_KEY);

        if (account) {
            const [accountId, publicKey] = JSON.parse(account);
            this.account = await recoverAccountByParams(accountId, publicKey, {
                provider: this.provider
            });
        }
    }
}

export {WebauthnConnector}
