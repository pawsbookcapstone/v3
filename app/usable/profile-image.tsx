import { useAppContext } from "@/AppsProvider";
import { Colors } from "@/shared/colors/Colors";
import { useMemo } from "react";
import { Image, Text, View } from "react-native";

const ProfileImage = ({style, source, name} : {style:any, source: {uri?:string | null | undefined}, name?: string }) => {
  if (source.uri)
    return (
      <Image style={style} source={{uri:source.uri}}/>
    );

  const {userName} = useAppContext()

  const tempProfile = useMemo(() => {
    // Get the name to use
    const fullName = name ?? userName ?? "";

    // Split the name by spaces and filter out empty strings
    const nameParts = fullName
      .split(" ")
      .filter((part:string) => part.trim().length > 0);

    // Take the first letter of the first two words
    let initials = "";
    if (nameParts.length === 1) {
      initials = nameParts[0][0].toUpperCase();
    } else if (nameParts.length > 1) {
      initials = (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }

    return initials;
  }, [name, userName]);

  return (
    <View style={{backgroundColor: Colors.primary, ...style, 
    justifyContent: "center",
    alignItems: "center" }}>
      <Text style={{
        color: Colors.white,
        textAlign: "center",
        fontSize: style.fontSize ?? 20,
        fontWeight: 600
      }}>{tempProfile}</Text>
    </View>
  );
};

export default ProfileImage;
