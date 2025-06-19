import { Howl } from "howler";

export const bgm = new Howl({
  src: ["/sounds/bgm.mp3"],
  loop: true,
  volume: 0.5,
});

export const winSound = new Howl({
  src: ["/sounds/win.wav"],
  volume: 1.0,
});

export const failSound = new Howl({
  src: ["/sounds/fail.wav"],
  volume: 1.0,
  rate: 1.5,
});
