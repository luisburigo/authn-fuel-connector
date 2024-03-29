import { Address, arrayify, BaseAssetId, Predicate, Provider } from 'fuels';
import { FuelAbi__factory } from './types/index';

export const types = {
  Provider,
  BaseAssetId,
  Address
};

export default function buildPredicate(provider: Provider, address: string) {
  const configurable = {
    ADDRESS: address
  };
  const predicate = FuelAbi__factory.createInstance(provider, configurable);

  return predicate;
}

// @ts-ignore
export function setData(predicate: Predicate, signature: string, authid: string, txid: string, pre: string, post: string) {
  predicate.setData(
    signature,
    Array.from(arrayify(authid)),
    txid,
    Array.from(arrayify(pre)),
    Array.from(arrayify(post))
  );
}
