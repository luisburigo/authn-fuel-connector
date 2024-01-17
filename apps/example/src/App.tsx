import './App.css'
import {
    useAccount,
    useAccounts,
    useBalance,
    useConnect,
    useDisconnect,
    useIsConnected,
    useWallet
} from "@fuel-wallet/react";
import {useState} from "react";

const Connection = ({onConnected}: { onConnected: () => void }) => {
    const {connectAsync} = useConnect();

    const handleConnect = async () => {
        await connectAsync();
        onConnected();
    }

    return (
        <button onClick={handleConnect}>Connect</button>
    )
}

const Account = ({onDisconnect}: { onDisconnect: () => void }) => {
    const {account} = useAccount();
    const {accounts} = useAccounts();
    const {disconnectAsync} = useDisconnect();
    const {balance} = useBalance({address: account ?? undefined});
    const {wallet} = useWallet(account);

    const [signature, setSignature] = useState('')

    const handleDisconnect = async () => {
        await disconnectAsync();
        onDisconnect();
    }

    const handleSignMessage = async () => {
        const _signature = await wallet!.signMessage('6c50fb26b51a10e2e498e56e794935a9caba1bae0d62169c0474899877b77991');
        setSignature(_signature)
    }

    return (
        <div>
            <p>Current Account {account}</p>
            <p>
                Accounts
                <code>
                    {JSON.stringify(accounts, null, 2)}
                </code>
            </p>
            <p>Balance {balance?.format()}</p>
            {signature && <p>Signature {signature}</p>}
            <button onClick={handleSignMessage}>Sign message</button>
            <button onClick={handleDisconnect}>Disconnect</button>
        </div>
    )
}

function App() {
    const {isConnected, refetch} = useIsConnected();

    if (!isConnected) {
        return <Connection onConnected={refetch}/>
    }

    return <Account onDisconnect={refetch}/>
}

export default App
