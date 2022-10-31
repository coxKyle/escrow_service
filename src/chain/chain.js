import { ethers } from 'ethers';
import { BigNumber } from 'ethers';
import ABI_SERVICE from './abis/ABI_SERVICE.json';
import BC_SERVICE from './abis/BC_SERVICE.json';

export var provider;
try {
    provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
} catch {
    alert('install metamask')
}
export var signer;
const contractAddress = '0xe5c5b261610E5F6C4d290883bccd896fE0bB73D7';
const errorAlert = 'ERROR:\n1: connect wallet\n2: retry inputs\n3: switch to bsc testnet (chainID: 97)';
const refreshAlert = 'ERROR: refresh page';
var cSERVICE;


//switch account
provider.on('accountsChanged', async() => {
    try {
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner(0);
    } catch {
        alert(refreshAlert);
    }
});

export async function connectWallet() {
    try {
        if (window.ethereum) {
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner(0);
            setContracts(contractAddress);
            console.log(await signer.getAddress());
            return true;
        } else {
            alert('no wallet found');
            return false;
        }
    } catch {
        alert(refreshAlert);
    }
}

export async function deploy() {
    cSERVICE = await new ethers.ContractFactory(ABI_SERVICE, BC_SERVICE, signer).deploy();
}

export async function getContracts() {
    console.log(cSERVICE);
}

export async function setContracts(contractAddress) {
    try {
        cSERVICE = new ethers.Contract(contractAddress, ABI_SERVICE, signer);
        getContracts();
    } catch {
        alert(refreshAlert);
    }
}

export async function createService(name, tags, location, wallet, paymentWei, email) {
    try {
        await cSERVICE.createService(name, tags, location, wallet, paymentWei, email);
    } catch {
        alert(errorAlert);
    }
}

export async function requestService(ID) {
    try{
        await cSERVICE.requestService(ID, {value: getPaymentWei(ID)});
    } catch {
        alert(errorAlert);
    }
}

export async function acceptRequest(ID, clientWallet) {
    try{
        let fee = await getPaymentWei(ID) * await cSERVICE.antiExploitFee() / 100;
        await cSERVICE.acceptRequest(ID, clientWallet, {value: fee});
    } catch {
        alert(errorAlert);
    }
}

export async function withdrawRequest(ID) {
    try {
        await cSERVICE.withdrawRequest(ID);
    } catch {
        alert(errorAlert);
    }
}

export async function changeOutcome(ID, clientWallet, complete) {
    try {
        await cSERVICE.changeOutcome(ID, clientWallet, complete);
    } catch {
        alert(errorAlert);
    }
}

export async function claim(ID, clientWallet, complete) {
    try {
        await cSERVICE.claim(ID, clientWallet, complete);
    } catch (e) {
        
        alert('ERROR:\n3 day pending requirement');
        getConfirmations(ID, clientWallet);
    }
}

export async function findServicesID(search, maxSearch, firstID) {
    try {
        let IDs = await cSERVICE.findServicesID(search, maxSearch, firstID);
        let r = [];
        for (let i = 0; i < IDs.length; i++) {
            if (IDs[i].eq(BigNumber.from(0))) {
                break;
            }
            r.push(IDs[i]);
        }
        return r;
    } catch {
        alert(errorAlert);
    }
}

//getters
export async function getConfirmations(ID, clientWallet) {
    try {
        let s = [];
        let g = await cSERVICE.getConfirmations(ID, clientWallet);
        for (let i=0; i < g.length; i++) {
            if (g[i].toString() === '0') {
                s.push('pending');
            } else if (g[i].toString() === '1') {
                s.push('denied');
            } else if (g[i].toString() === '2') {
                s.push('approved');
            }
        }
        alert('service: ' + s[0] +'\nclient: ' + s[1]);
    } catch {
        alert(errorAlert);
    }
}

export async function getName(ID) {
    return await cSERVICE.getName(ID);
}

export async function getLocation(ID) {
    return await cSERVICE.getLocation(ID);
}

export async function getPaymentWei(ID) {
    return await cSERVICE.getPaymentWei(ID);
}

export async function getWallet(ID) {
    return await cSERVICE.getWallet(ID);
}

export async function getDistrust(ID) {
    return await cSERVICE.getDistrust(ID);
}

export async function getCompletions(ID) {
    return await cSERVICE.getCompletions(ID);
}

export async function getEmail(ID) {
    return await cSERVICE.getEmail(ID);
}
