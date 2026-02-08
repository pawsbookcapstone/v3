import { useFocusEffect } from "expo-router";
import { EffectCallback, useCallback } from "react";

export function useOnFocusHook(callback: EffectCallback, deps?: React.DependencyList){
    useFocusEffect(
        useCallback(callback, deps ?? [])
    )
}