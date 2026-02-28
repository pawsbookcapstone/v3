import { useVideoPlayer, VideoView } from "expo-video";
import { StyleProp, ViewStyle } from "react-native";

export function VideoPlayer({
  style,
  url,
}: {
  style: StyleProp<ViewStyle>;
  url: any;
}) {
  const player = useVideoPlayer(url, (player) => {
    player.loop = true;
  });

  return (
    <VideoView
      style={style}
      player={player}
      allowsFullscreen
      allowsPictureInPicture
    />
  );
}
