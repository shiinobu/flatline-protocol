import { SharedVariables } from "@hotbunny/hackhub-content-sdk";

const M01_VAULT_SEAL_KEY = "flatline.m01.vaultSealed";

export const setM01VaultSealed = (sealed: boolean): void => SharedVariables.set(M01_VAULT_SEAL_KEY, sealed);

export const clearM01VaultSeal = (): void => SharedVariables.remove(M01_VAULT_SEAL_KEY);

export const isM01VaultSealed = (): boolean => SharedVariables.get<boolean>(M01_VAULT_SEAL_KEY) === true;
