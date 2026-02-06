import { useState } from "react"
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Loader2 } from "lucide-react-native";

export function useLoadingProccessHook(){
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const renderLoading = () => {
    return (
  <View style={styles.content}>
        {loading && (
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Loader2 size={18} color="#fff" />
          </Animated.View>
        )}
        <Text style={[styles.buttonText, textStyle]}>
          {loading ? "Please wait..." : title}
        </Text>
      </View>)}

  const proccess = async ({func, onSuccess, onError}:{func:()=>any, onSuccess?:()=>void, onError?: (error:any) => void}) => {
    try{
      setLoading(true)
      setError(null)
      await func()
      if (onSuccess)
        onSuccess()
    }
    catch (e:any) {
      if (onError)
        onError(e)
      setError(e)
    }
    finally{
      setLoading(false)
    }
  }

  return {
    proccess,
    loading,
    error
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#000",
    alignItems: "center",
  },
  disabled: {
    opacity: 0.7,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});