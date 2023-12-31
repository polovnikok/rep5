import { parseUnits, parseEther } from "@ethersproject/units";
import { sleep, linea_provider, explorer } from "./utils.js";
import { BigNumber, Wallet, ethers, utils } from "ethers";
import { defaultAbiCoder } from "@ethersproject/abi";
import { importETHWallets, writeContractToFile } from "./accs.js";
import chalk from "chalk";


let price = "2000"


function getRandomInt(max) {
    return Math.round(Math.random() * max, 0);
}
function getRandomDeadline() {
    let day = 86400;
    let tsNow = Date.now() / 1000; // timestamp in sec
    // deadline from +1 day to +6 days
    let tsRandom = Math.round(tsNow + day * (Math.random() * getRandomInt(5) + 1));
    return tsRandom;
}
async function swapEthForApe(signer) {
    let hexDeadline = getRandomDeadline().toString(16);
    // console.log(hexDeadline)
    let data = `0x5ae401dc00000000000000000000000000000000000000000000000000000000${hexDeadline}00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e404e45aaf0000000000000000000000002c1b868d6596a18e32e61b901e4060c872647b6c000000000000000000000000d2340c4ec834bf43c05b9eccd60eed3a20892dcc0000000000000000000000000000000000000000000000000000000000000bb8000000000000000000000000${signer.address.slice(2)}000000000000000000000000000000000000000000000000000000e8d4a510000000000000000000000000000000000000000000000000000001329d6a796509000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000`;
    let tx = {
        to: "0x6aa397CAB00a2A40025Dbf839a83f16D5EC7c1eB",
        data: data,
        value: parseEther("0.00001"),
        nonce: await linea_provider.getTransactionCount(signer.address),
    }
    let swapTx;
    try {
        // console.log(tx)
        // let gasLimit = await signer.estimateGas(tx);
        let gasLimit = BigNumber.from("200000");
        // console.log(gasLimit);

        tx.gasLimit = gasLimit;
        tx.gasPrice = (await getGasPrice()).mul("11").div("10");
        // tx.gasPrice = parseUnits(price, "gwei");
        console.log("total eth needed for tx:", utils.formatEther(gasLimit.mul(tx.gasPrice)));
        while (gasLimit.mul(await getGasPrice()).gte("800000000000000000")) {
            await sleep(15);
            console.log("too much eth needed, sleeping");
        }
        tx.gasPrice = (await getGasPrice()).mul("11").div("10");
        swapTx = await signer.sendTransaction(tx);
        console.log("bought ape on Uniswap,", chalk.green("+15 PTS"), "\n" + explorer + swapTx.hash);
    } catch (e) {
        // console.log(e);
        if (e.reason.includes("missing")) {
            console.log("нода послала нахуй, адихаем 2 минуты");
            await sleep(120);
            return await swapEthForApe(signer);
        }
        if (e.reason.includes("replacement")) {
            console.log("пендинг транзакция, ждём");
            await sleep(120);
            return await swapEthForApe(signer);
        }
        console.log(e.reason);
        console.log(chalk.red("error buying ape on Uni"));
        return 0;
    }
    return 15;
}
async function placeLimitIzi(signer) {
    let hexDeadline = getRandomDeadline().toString(16);
    // console.log(hexDeadline)
    let data = `0xac9650d8000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001045ddf5745000000000000000000000000000000000000000000000000000000000000000000000000000000000000000067a1f4a939b477a6b7c5bf94d97e45de87e608ef000000000000000000000000f56dc6695cf1f5c364edebc7dc7077ac9b5860680000000000000000000000000000000000000000000000000000000000002710fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe3ec8000000000000000000000000000000000000000000000000000009184e72a000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000${hexDeadline}00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000412210e8a00000000000000000000000000000000000000000000000000000000`;
    let tx = {
        to: "0x1eE5eDC5Fe498a2dD82862746D674DB2a5e7fef6",
        data: data,
        value: parseEther("0.00001"),
        nonce: await linea_provider.getTransactionCount(signer.address),
    }
    let limitTx;
    try {
        // console.log(tx)
        // let gasLimit = await signer.estimateGas(tx);
        let gasLimit = BigNumber.from("300000");
        // console.log(gasLimit);

        tx.gasLimit = gasLimit;
        tx.gasPrice = (await getGasPrice()).mul("11").div("10");
        // tx.gasPrice = parseUnits(price, "gwei");
        console.log("total eth needed for tx:", utils.formatEther(gasLimit.mul(tx.gasPrice)));
        while (gasLimit.mul(await getGasPrice()).gte("800000000000000000")) {
            await sleep(15);
            console.log("too much eth needed, sleeping");
        }
        tx.gasPrice = (await getGasPrice()).mul("11").div("10");
        limitTx = await signer.sendTransaction(tx);
        console.log("placed limit on Izumi,", chalk.green("+10 PTS"), "\n" + explorer + limitTx.hash);
    } catch (e) {
        // console.log(e);
        if (e.reason.includes("missing")) {
            console.log("нода послала нахуй, адихаем 2 минуты");
            await sleep(120);
            return await placeLimitIzi(signer);
        }
        if (e.reason.includes("replacement")) {
            console.log("пендинг транзакция, ждём");
            await sleep(120);
            return await swapEthForApe(signer);
        }
        console.log(e.reason);
        console.log(chalk.red("error placing limit on Izumi"));
        return 0;
    }
    return 10;
}
async function swapOpenOcean(signer) {
    let data = `0x90411a320000000000000000000000002b5f704ab7061fb4dbfc5876b024f4bdb2f5e8b6000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001c0000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000b77c5a8426ee2af0ef2a69fe1202dbaffd0fbddf0000000000000000000000002b5f704ab7061fb4dbfc5876b024f4bdb2f5e8b6000000000000000000000000${signer.address.slice(2)}000000000000000000000000000000000000000000000000000009184e72a00000000000000000000000000000000000000000000000000000000000000018dc00000000000000000000000000000000000000000000000000000000000031b800000000000000000000000000000000000000000000000000000000000000000000000000000000000000003487ef9f9b36547e43268b8f0e2349a226c70b53000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001000000000000000000000000002c1b868d6596a18e32e61b901e4060c872647b6c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009184e72a00000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000004d0e30db000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000002449f8654220000000000000000000000002c1b868d6596a18e32e61b901e4060c872647b6c00000000000000000000000000000001000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000004400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000104e5b07cdb0000000000000000000000006c08d9be233151c45a155aefbcbbbb16ba04dd6a00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000${signer.address.slice(2)}00000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000002e2c1b868d6596a18e32e61b901e4060c872647b6c000bb8b77c5a8426ee2af0ef2a69fe1202dbaffd0fbddf0000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000`;
    let tx = {
        to: "0x6352a56caadC4F1E25CD6c75970Fa768A3304e64",
        data: data,
        value: parseEther("0.00001"),
        nonce: await linea_provider.getTransactionCount(signer.address),
    }
    let swapTx;
    try {
        // console.log(tx)
        // let gasLimit = await signer.estimateGas(tx);
        let gasLimit = BigNumber.from("300000");
        // console.log(gasLimit);

        tx.gasLimit = gasLimit;
        tx.gasPrice = (await getGasPrice()).mul("11").div("10");
        // tx.gasPrice = parseUnits(price, "gwei");
        console.log("total eth needed for tx:", utils.formatEther(gasLimit.mul(tx.gasPrice)));
        while (gasLimit.mul(await getGasPrice()).gte("800000000000000000")) {
            await sleep(15);
            console.log("too much eth needed, sleeping");
        }
        tx.gasPrice = (await getGasPrice()).mul("11").div("10");
        swapTx = await signer.sendTransaction(tx);
        console.log("swapped on OpenOcean,", chalk.green("+15 PTS"), "\n" + explorer + swapTx.hash);
    } catch (e) {
        // console.log(e);
        if (e.reason.includes("missing")) {
            console.log("нода послала нахуй, адихаем 2 минуты");
            await sleep(120);
            return await swapOpenOcean(signer);
        }
        if (e.reason.includes("replacement")) {
            console.log("пендинг транзакция, ждём");
            await sleep(120);
            return await swapEthForApe(signer);
        }
        console.log(e.reason);
        console.log(chalk.red("error durnig swap on OpenOcean"));
        return 0;
    }
    return 15;
}
async function swapEthPancake(signer) {
    let hexDeadline = getRandomDeadline().toString(16);
    // console.log(hexDeadline)
    let data = `0x5ae401dc00000000000000000000000000000000000000000000000000000000${hexDeadline}00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e404e45aaf0000000000000000000000002c1b868d6596a18e32e61b901e4060c872647b6c000000000000000000000000f56dc6695cf1f5c364edebc7dc7077ac9b58606800000000000000000000000000000000000000000000000000000000000009c4000000000000000000000000${signer.address.slice(2)}000000000000000000000000000000000000000000000000000009184e72a0000000000000000000000000000000000000000000000000000000000000377182000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000`;
    let tx = {
        to: "0x21d809FB4052bb1807cfe2418bA638d72F4aEf87",
        data: data,
        value: parseEther("0.00001"),
        nonce: await linea_provider.getTransactionCount(signer.address),
    }
    let swapTx;
    try {
        // console.log(tx)
        // let gasLimit = await signer.estimateGas(tx);
        let gasLimit = BigNumber.from("200000");
        // console.log(gasLimit);

        tx.gasLimit = gasLimit;
        tx.gasPrice = (await getGasPrice()).mul("11").div("10");
        // tx.gasPrice = parseUnits(price, "gwei");
        console.log("total eth needed for tx:", utils.formatEther(gasLimit.mul(tx.gasPrice)))
        while (gasLimit.mul(await getGasPrice()).gte("800000000000000000")) {
            await sleep(15);
            console.log("too much eth needed, sleeping");
        }
        tx.gasPrice = (await getGasPrice()).mul("11").div("10");
        swapTx = await signer.sendTransaction(tx);
        console.log("bought usdc on Pancake,", chalk.green("+10 PTS"), "\n" + explorer + swapTx.hash);
    } catch (e) {
        // console.log(e);
        if (e.reason.includes("missing")) {
            console.log("нода послала нахуй, адихаем 2 минуты");
            await sleep(120);
            return await swapEthForApe(signer);
        }
        if (e.reason.includes("replacement")) {
            console.log("пендинг транзакция, ждём");
            await sleep(120);
            return await swapEthForApe(signer);
        }
        console.log(e.reason);
        console.log(chalk.red("error swapping on pancake"));
        return 0;
    }
    return 10;
}
async function getGasPrice() {
    let fee = await linea_provider.getFeeData();
    // console.log(fee)
    let price = fee.gasPrice;
    return price;
}
// getGasPrice()
export { swapEthForApe, placeLimitIzi, swapOpenOcean, swapEthPancake };
