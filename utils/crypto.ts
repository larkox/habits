import { randomUUID } from 'expo-crypto';

export function newId() {
    return randomUUID();    
}